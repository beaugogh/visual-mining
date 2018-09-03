# Data Specification

Here we detail the input data specifications for FreeBu.

In order to make FreeBu generic, we define a simple format for the input data. As an online tool, FreeBu is written mainly in Javascript, and JSON is the standard language that Javascript uses to communicate data, we use JSON as our input data format, as other Javascript-based tools or APIs do. 

---
***Network Data***

The first part of the input dataset is a network dataset. An example (partial) is shown in below, it has two array: “nodes” and “links”. The “nodes” array contains a list of nodes, these are friend nodes. The “links” array contains the list links among the nodes. A link must have “source” and “target” items that contain the indices that refer to the node lists, in the order of the appearances of the nodes. A link can further contain customized items such as “weight”.

```json
{
  "nodes": [
    {
      "id": "1940985",
      "name": "Sharyn",
      "attributes": [
        {
          "name": "birthday",
          "id": "birthday",
          "type": ["info"],
          "value": "07/31"
        },
        {
          "name": "community",
          "id": "comm",
          "type": ["polynary"],
          "value": "RABB"
        },
        {
          "name": "betweenness",
          "id": "between",
          "type": ["numeric"],
          "value": 0.051818691194057465
        },
        {
          "name": "chat freq.",
          "id": "chat_freq",
          "type": ["numeric"],
          "value": 0
        },
        {
          "name": "education",
          "id": "edu",
          "type": ["binary"],
          "value": [
            "University of Illinois at Urbana-Champaign",
            "KU Leuven",
            "UCLA"
          ]
        }
      ]
    },
    {
     "id": "8637268",
      "name": "Providencia",
      "attributes": [
      ]
    }
  ],
  "links": [
    {
      "source": 0,
      "target": 1,
      "weight": 3.5
    }
  ]
}
```

Each node must have three keys: `id`, `name` and `attributes`. The `id` value needs to be unique, the `name` is used to label the node in the visualizations, and the `attributes` is a list of attributes that are used in filter and search section of FreeBu. An attribute must have the following keys: `id`, `name`, `type` and `value`. An attribute can be of the types: `info`, `polynary`, `binary` and `numeric`. The `info`-typed attributes are used in the tip that appears on top of a node during mouse-hover. The type `polynary` refers to an attribute with more than two categorical values in all the nodes. Similarly, the type `binary` refers to an attribute with with two categorical values. The type `numeric` refers to an attribute with numerical values. An attribute can be both `info` and any of the types `polynary`, `binary` and `numeric`. The `value` item of a `binary` attribute is an array, which may contain multiple values. Note that we pre-computed the communities, betweenness values and chat frequencies in our example dataset, as you will see when first opening FreeBu.

---

***Hierarchy Data***

The second part of the input dataset is hierarchical data. An example (partial) is shown below. A non-leaf node in the hierarchy has two keys: `name` with a string value and `children` with an array. A leaf node is one of the nodes in the graph input data, only with the `id` and `name` values. In our example, we use the modularity-based community detection algorithm iteratively on the network data to derive the hierarchical dataset. It corresponds to the hierarchical circles in the "hierarchy view" of FreeBu.

```json
{
  "children": [
    {
      "children": [
        {
          "name": "Antonina",
          "id": "818109931"
        },
        {
          "name": "Maye",
          "id": "1280895426"
        }
      ],
      "name": "comm_1"
    }
  ],
  "name": "root"
}
```

---
***Composing Input Dataset***

Compose the network and the hierarchy into one json file, as shown below, and drag/drop it at the bottom of the FreeBu page to visualize it. 

```json
{
  "nodes": [
  ],
  "links": [
  ],
  "hierarchy": {
  }
}
```
