// ─── Curriculum Data ─────────────────────────────────────────────────────────
// Each subject has a list of topics with prerequisite links (edges).
// Used by the Knowledge Graph and Risk Dashboard.

export interface Topic {
  id: string;
  label: string;
  prerequisites: string[]; // ids of topics that must be known first
}

export interface SubjectCurriculum {
  name: string;
  topics: Topic[];
}

export const SUBJECTS: Record<string, SubjectCurriculum> = {
  ml: {
    name: "Machine Learning",
    topics: [
      // Foundations
      { id: "linear_algebra", label: "Linear Algebra", prerequisites: [] },
      { id: "calculus", label: "Calculus & Derivatives", prerequisites: [] },
      { id: "probability", label: "Probability & Statistics", prerequisites: [] },
      { id: "python_basics", label: "Python Basics", prerequisites: [] },
      { id: "numpy_pandas", label: "NumPy & Pandas", prerequisites: ["python_basics"] },
      { id: "data_viz", label: "Data Visualization", prerequisites: ["numpy_pandas"] },

      // Core ML Concepts
      { id: "supervised_learning", label: "Supervised Learning", prerequisites: ["linear_algebra", "probability"] },
      { id: "unsupervised_learning", label: "Unsupervised Learning", prerequisites: ["linear_algebra", "probability"] },
      { id: "feature_engineering", label: "Feature Engineering", prerequisites: ["numpy_pandas", "supervised_learning"] },
      { id: "model_evaluation", label: "Model Evaluation & Metrics", prerequisites: ["probability", "supervised_learning"] },
      { id: "overfitting", label: "Overfitting & Regularization", prerequisites: ["supervised_learning", "calculus"] },
      { id: "cross_validation", label: "Cross-Validation", prerequisites: ["model_evaluation"] },

      // Algorithms
      { id: "linear_regression", label: "Linear Regression", prerequisites: ["linear_algebra", "calculus", "supervised_learning"] },
      { id: "logistic_regression", label: "Logistic Regression", prerequisites: ["linear_regression", "probability"] },
      { id: "decision_trees", label: "Decision Trees", prerequisites: ["supervised_learning"] },
      { id: "random_forests", label: "Random Forests", prerequisites: ["decision_trees", "overfitting"] },
      { id: "svm", label: "Support Vector Machines", prerequisites: ["linear_algebra", "supervised_learning", "overfitting"] },
      { id: "knn", label: "K-Nearest Neighbors", prerequisites: ["supervised_learning"] },
      { id: "kmeans", label: "K-Means Clustering", prerequisites: ["unsupervised_learning", "linear_algebra"] },
      { id: "pca", label: "PCA & Dimensionality Reduction", prerequisites: ["linear_algebra", "unsupervised_learning"] },
      { id: "naive_bayes", label: "Naïve Bayes", prerequisites: ["probability", "supervised_learning"] },

      // Deep Learning
      { id: "neural_networks", label: "Neural Networks", prerequisites: ["calculus", "linear_algebra", "supervised_learning"] },
      { id: "backpropagation", label: "Backpropagation", prerequisites: ["neural_networks", "calculus"] },
      { id: "cnns", label: "Convolutional Neural Nets", prerequisites: ["backpropagation"] },
      { id: "rnns", label: "Recurrent Neural Nets", prerequisites: ["backpropagation"] },
      { id: "transformers", label: "Transformers & Attention", prerequisites: ["rnns", "backpropagation"] },
      { id: "transfer_learning", label: "Transfer Learning", prerequisites: ["cnns", "rnns"] },

      // Applied
      { id: "nlp_basics", label: "NLP Fundamentals", prerequisites: ["probability", "numpy_pandas"] },
      { id: "computer_vision", label: "Computer Vision", prerequisites: ["cnns"] },
      { id: "model_deployment", label: "Model Deployment", prerequisites: ["model_evaluation", "python_basics"] },
    ],
  },

  ds: {
    name: "Data Structures",
    topics: [
      // Basics
      { id: "arrays", label: "Arrays", prerequisites: [] },
      { id: "strings", label: "Strings", prerequisites: ["arrays"] },
      { id: "complexity", label: "Big-O Complexity", prerequisites: ["arrays"] },
      { id: "pointers", label: "Pointers & Memory", prerequisites: [] },
      { id: "recursion", label: "Recursion", prerequisites: ["arrays"] },

      // Linear Structures
      { id: "linked_list", label: "Linked Lists", prerequisites: ["pointers", "arrays"] },
      { id: "doubly_linked", label: "Doubly Linked Lists", prerequisites: ["linked_list"] },
      { id: "stack", label: "Stacks", prerequisites: ["arrays"] },
      { id: "queue", label: "Queues", prerequisites: ["arrays"] },
      { id: "deque", label: "Deques", prerequisites: ["queue", "stack"] },
      { id: "circular_queue", label: "Circular Queues", prerequisites: ["queue"] },

      // Hashing
      { id: "hash_tables", label: "Hash Tables", prerequisites: ["arrays", "complexity"] },
      { id: "hash_collision", label: "Collision Resolution", prerequisites: ["hash_tables"] },

      // Trees
      { id: "trees", label: "Tree Fundamentals", prerequisites: ["recursion", "pointers"] },
      { id: "binary_tree", label: "Binary Trees", prerequisites: ["trees"] },
      { id: "bst", label: "Binary Search Trees", prerequisites: ["binary_tree", "complexity"] },
      { id: "avl_tree", label: "AVL Trees", prerequisites: ["bst"] },
      { id: "heap", label: "Heaps & Priority Queue", prerequisites: ["binary_tree", "complexity"] },
      { id: "trie", label: "Tries", prerequisites: ["trees", "strings"] },
      { id: "segment_tree", label: "Segment Trees", prerequisites: ["binary_tree", "recursion"] },

      // Graphs
      { id: "graph_basics", label: "Graph Theory Basics", prerequisites: ["complexity"] },
      { id: "bfs", label: "BFS", prerequisites: ["graph_basics", "queue"] },
      { id: "dfs", label: "DFS", prerequisites: ["graph_basics", "recursion", "stack"] },
      { id: "dijkstra", label: "Dijkstra's Algorithm", prerequisites: ["bfs", "heap"] },
      { id: "bellman_ford", label: "Bellman-Ford", prerequisites: ["graph_basics", "bfs"] },
      { id: "mst", label: "Minimum Spanning Tree", prerequisites: ["graph_basics", "heap"] },
      { id: "topological_sort", label: "Topological Sort", prerequisites: ["dfs", "graph_basics"] },

      // Algorithms
      { id: "sorting", label: "Sorting Algorithms", prerequisites: ["arrays", "complexity"] },
      { id: "binary_search", label: "Binary Search", prerequisites: ["arrays", "sorting"] },
      { id: "dynamic_prog", label: "Dynamic Programming", prerequisites: ["recursion", "complexity"] },
      { id: "greedy", label: "Greedy Algorithms", prerequisites: ["complexity", "sorting"] },
    ],
  },

  electronics: {
    name: "Electronics",
    topics: [
      // Fundamentals
      { id: "ohms_law", label: "Ohm's Law", prerequisites: [] },
      { id: "kirchhoff", label: "Kirchhoff's Laws", prerequisites: ["ohms_law"] },
      { id: "dc_circuits", label: "DC Circuits", prerequisites: ["kirchhoff"] },
      { id: "ac_circuits", label: "AC Circuits & Phasors", prerequisites: ["dc_circuits"] },
      { id: "capacitors", label: "Capacitors", prerequisites: ["ohms_law"] },
      { id: "inductors", label: "Inductors", prerequisites: ["ohms_law"] },
      { id: "resonance", label: "RLC Resonance", prerequisites: ["capacitors", "inductors", "ac_circuits"] },

      // Semiconductor Devices
      { id: "semiconductors", label: "Semiconductor Basics", prerequisites: [] },
      { id: "diodes", label: "Diodes & Rectification", prerequisites: ["semiconductors", "dc_circuits"] },
      { id: "zener", label: "Zener Diodes", prerequisites: ["diodes"] },
      { id: "bjt", label: "BJT Transistors", prerequisites: ["semiconductors", "dc_circuits"] },
      { id: "fet", label: "FET & MOSFET", prerequisites: ["semiconductors", "bjt"] },
      { id: "bjt_amplifier", label: "BJT Amplifier Design", prerequisites: ["bjt", "ac_circuits"] },
      { id: "op_amp", label: "Operational Amplifiers", prerequisites: ["bjt_amplifier", "feedback"] },
      { id: "feedback", label: "Feedback Concepts", prerequisites: ["bjt_amplifier"] },

      // Digital Electronics
      { id: "boolean_algebra", label: "Boolean Algebra", prerequisites: [] },
      { id: "logic_gates", label: "Logic Gates", prerequisites: ["boolean_algebra"] },
      { id: "combinational", label: "Combinational Circuits", prerequisites: ["logic_gates"] },
      { id: "sequential", label: "Sequential Circuits & Flip-Flops", prerequisites: ["combinational"] },
      { id: "counters", label: "Counters & Registers", prerequisites: ["sequential"] },
      { id: "fsm", label: "Finite State Machines", prerequisites: ["sequential"] },
      { id: "adc_dac", label: "ADC & DAC", prerequisites: ["op_amp", "combinational"] },

      // Power & Systems
      { id: "power_supplies", label: "Power Supply Design", prerequisites: ["diodes", "capacitors", "zener"] },
      { id: "oscillators", label: "Oscillators", prerequisites: ["op_amp", "resonance"] },
      { id: "filters", label: "Active Filters", prerequisites: ["op_amp", "resonance"] },
      { id: "communication", label: "Communication Circuits", prerequisites: ["oscillators", "filters"] },
    ],
  },
};

export type SubjectKey = keyof typeof SUBJECTS;
