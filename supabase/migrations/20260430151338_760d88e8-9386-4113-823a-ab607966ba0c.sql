-- Subjects
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);
alter table public.subjects enable row level security;
create policy "Subjects are public" on public.subjects for select using (true);

-- Topics (knowledge graph nodes)
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  slug text unique not null,
  name text not null,
  description text,
  difficulty int not null default 1, -- 1..5
  prerequisite_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
alter table public.topics enable row level security;
create policy "Topics are public" on public.topics for select using (true);
create index idx_topics_subject on public.topics(subject_id);

-- Mastery per student per topic
create table public.student_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  mastery int not null default 0, -- 0..100
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, topic_id)
);
alter table public.student_topic_mastery enable row level security;
create policy "Own mastery select" on public.student_topic_mastery for select using (auth.uid() = user_id);
create policy "Own mastery insert" on public.student_topic_mastery for insert with check (auth.uid() = user_id);
create policy "Own mastery update" on public.student_topic_mastery for update using (auth.uid() = user_id);
create policy "Own mastery delete" on public.student_topic_mastery for delete using (auth.uid() = user_id);
create policy "Teachers view all mastery" on public.student_topic_mastery for select using (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin'));

create trigger student_topic_mastery_touch
  before update on public.student_topic_mastery
  for each row execute function public.touch_updated_at();

-- Assessments / check-ins
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  score int not null, -- 0..100
  notes text,
  created_at timestamptz not null default now()
);
alter table public.assessments enable row level security;
create policy "Own assessments select" on public.assessments for select using (auth.uid() = user_id);
create policy "Own assessments insert" on public.assessments for insert with check (auth.uid() = user_id);
create policy "Own assessments delete" on public.assessments for delete using (auth.uid() = user_id);
create policy "Teachers view assessments" on public.assessments for select using (public.has_role(auth.uid(), 'teacher') or public.has_role(auth.uid(), 'admin'));
create index idx_assessments_user on public.assessments(user_id, created_at desc);

-- Chat conversations + messages
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_conversations enable row level security;
create policy "Own conv select" on public.chat_conversations for select using (auth.uid() = user_id);
create policy "Own conv insert" on public.chat_conversations for insert with check (auth.uid() = user_id);
create policy "Own conv update" on public.chat_conversations for update using (auth.uid() = user_id);
create policy "Own conv delete" on public.chat_conversations for delete using (auth.uid() = user_id);

create trigger chat_conv_touch
  before update on public.chat_conversations
  for each row execute function public.touch_updated_at();

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "Own msgs select" on public.chat_messages for select using (auth.uid() = user_id);
create policy "Own msgs insert" on public.chat_messages for insert with check (auth.uid() = user_id);
create index idx_chat_messages_conv on public.chat_messages(conversation_id, created_at);

-- ============ SEED: Computer Science curriculum ============
insert into public.subjects (slug, name, description) values
  ('foundations',   'Foundations',          'Discrete math, logic, proofs that underpin CS.'),
  ('programming',   'Programming',          'Core programming concepts and paradigms.'),
  ('data-structures','Data Structures',     'Organizing data for efficient access.'),
  ('algorithms',    'Algorithms',           'Designing and analyzing efficient procedures.'),
  ('databases',     'Databases',            'Storing, querying, and modeling persistent data.'),
  ('os',            'Operating Systems',    'Processes, memory, concurrency, file systems.'),
  ('networks',      'Computer Networks',    'How machines communicate across layers.'),
  ('systems',       'Computer Systems',     'Architecture, assembly, performance.'),
  ('theory',        'Theory of Computation','Automata, languages, complexity.'),
  ('ai-ml',         'AI & Machine Learning','Learning from data, models, evaluation.'),
  ('software-eng',  'Software Engineering', 'Designing and shipping reliable software.'),
  ('security',      'Security',             'Threats, cryptography, secure design.');

-- Topics (we'll wire prerequisites in a second pass)
with s as (select slug, id from public.subjects)
insert into public.topics (subject_id, slug, name, description, difficulty)
select s.id, t.slug, t.name, t.descr, t.diff from (values
  -- foundations
  ('foundations','logic-proofs','Logic & Proofs','Propositional logic, predicates, induction.',2),
  ('foundations','sets-relations','Sets & Relations','Sets, functions, equivalence relations.',1),
  ('foundations','combinatorics','Combinatorics','Counting, permutations, pigeonhole.',2),
  ('foundations','probability','Discrete Probability','Sample spaces, expectation, variance.',3),

  -- programming
  ('programming','variables-types','Variables & Types','Primitive types, scope, immutability.',1),
  ('programming','control-flow','Control Flow','Branches, loops, recursion basics.',1),
  ('programming','functions','Functions','Parameters, returns, pure functions.',1),
  ('programming','oop','Object-Oriented Programming','Classes, inheritance, polymorphism.',2),
  ('programming','functional','Functional Programming','Higher-order, immutability, map/reduce.',3),

  -- data structures
  ('data-structures','arrays-lists','Arrays & Lists','Contiguous and linked sequences.',2),
  ('data-structures','stacks-queues','Stacks & Queues','LIFO and FIFO patterns.',2),
  ('data-structures','hash-tables','Hash Tables','Hashing, collisions, load factor.',3),
  ('data-structures','trees','Trees','Binary trees, BSTs, traversals.',3),
  ('data-structures','heaps','Heaps & Priority Queues','Heap property, heapify.',3),
  ('data-structures','graphs','Graphs','Representations, basic properties.',3),

  -- algorithms
  ('algorithms','complexity','Big-O & Complexity','Asymptotic analysis, recurrences.',3),
  ('algorithms','sorting','Sorting','Merge, quick, heap, lower bounds.',3),
  ('algorithms','searching','Searching','Binary search, ternary search.',2),
  ('algorithms','divide-conquer','Divide & Conquer','Master theorem, recursion patterns.',4),
  ('algorithms','greedy','Greedy Algorithms','Exchange arguments, scheduling.',4),
  ('algorithms','dp','Dynamic Programming','Memoization, tabulation, state design.',5),
  ('algorithms','graph-algos','Graph Algorithms','BFS, DFS, Dijkstra, MST.',4),

  -- databases
  ('databases','relational-model','Relational Model','Schemas, keys, integrity.',2),
  ('databases','sql','SQL','Joins, aggregation, subqueries.',2),
  ('databases','normalization','Normalization','1NF–BCNF, decomposition.',3),
  ('databases','transactions','Transactions','ACID, isolation levels.',4),
  ('databases','indexing','Indexing','B-trees, hash indexes, query plans.',4),

  -- os
  ('os','processes','Processes & Threads','Scheduling, context switching.',3),
  ('os','memory','Memory Management','Virtual memory, paging.',4),
  ('os','concurrency','Concurrency','Locks, races, deadlocks.',5),
  ('os','filesystems','File Systems','Inodes, journaling, layout.',3),

  -- networks
  ('networks','osi-tcpip','OSI & TCP/IP Layers','Layered models and roles.',2),
  ('networks','tcp-udp','TCP & UDP','Reliability, flow control.',3),
  ('networks','http','HTTP & DNS','Web protocols and naming.',2),

  -- systems
  ('systems','architecture','Computer Architecture','CPU, cache, pipelines.',4),
  ('systems','assembly','Assembly Basics','Registers, instructions.',4),

  -- theory
  ('theory','automata','Automata & Languages','DFA, NFA, regex.',3),
  ('theory','turing','Turing Machines','Decidability, halting.',5),
  ('theory','np','P, NP & Reductions','NP-completeness intuition.',5),

  -- ai-ml
  ('ai-ml','linear-models','Linear Models','Regression, classification.',3),
  ('ai-ml','neural-nets','Neural Networks','Layers, backprop intuition.',4),
  ('ai-ml','evaluation','Model Evaluation','Train/test, metrics, overfitting.',3),

  -- software eng
  ('software-eng','version-control','Version Control','Git, branching, merging.',1),
  ('software-eng','testing','Testing','Unit, integration, TDD.',2),
  ('software-eng','design-patterns','Design Patterns','Common reusable solutions.',3),

  -- security
  ('security','crypto-basics','Cryptography Basics','Symmetric, asymmetric, hashing.',3),
  ('security','web-security','Web Security','XSS, CSRF, injection.',3)
) as t(subject_slug, slug, name, descr, diff)
join s on s.slug = t.subject_slug;

-- Wire prerequisites
with t as (select slug, id from public.topics)
update public.topics tg set prerequisite_ids = (
  select coalesce(array_agg(t.id), '{}'::uuid[])
  from t
  where t.slug = any(
    case tg.slug
      when 'control-flow'    then array['variables-types']
      when 'functions'       then array['control-flow']
      when 'oop'             then array['functions']
      when 'functional'      then array['functions']
      when 'arrays-lists'    then array['variables-types']
      when 'stacks-queues'   then array['arrays-lists']
      when 'hash-tables'     then array['arrays-lists']
      when 'trees'           then array['arrays-lists','functions']
      when 'heaps'           then array['trees']
      when 'graphs'          then array['trees']
      when 'complexity'      then array['functions','sets-relations']
      when 'sorting'         then array['arrays-lists','complexity']
      when 'searching'       then array['arrays-lists','complexity']
      when 'divide-conquer'  then array['complexity','sorting']
      when 'greedy'          then array['complexity']
      when 'dp'              then array['complexity','divide-conquer']
      when 'graph-algos'     then array['graphs','complexity']
      when 'sql'             then array['relational-model']
      when 'normalization'   then array['relational-model']
      when 'transactions'    then array['sql']
      when 'indexing'        then array['sql','trees']
      when 'memory'          then array['processes']
      when 'concurrency'     then array['processes']
      when 'filesystems'     then array['processes']
      when 'tcp-udp'         then array['osi-tcpip']
      when 'http'            then array['osi-tcpip']
      when 'assembly'        then array['architecture']
      when 'turing'          then array['automata']
      when 'np'              then array['turing','complexity']
      when 'neural-nets'     then array['linear-models']
      when 'evaluation'      then array['linear-models']
      when 'web-security'    then array['http']
      when 'probability'     then array['sets-relations']
      when 'combinatorics'   then array['sets-relations']
      else array[]::text[]
    end
  )
);