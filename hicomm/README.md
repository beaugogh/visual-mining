# HiComm


HiComm (Hierarchical Communities) is an algorithm that leverages [Newman's Modularity-based community detection](https://scholar.google.be/scholar?cluster=4077256749184554581&hl=en&as_sdt=2005&sciodt=0,5) to produce a hierarchy of communities.

More specifically, the original community detection algorithm is applied to each sub-network that corresponds to a community, and sub-communities are generated iteratively. A sub-network of a community contains all the community member nodes and the edges whose two end nodes are both inside the community. We use the Java implementation of Newman's spectral algorithm from [T. Schaffter and D. Marbach](http://tschaffter.ch/projects/jmod/index.php).

Furthermore, as the singleton nodes (which do not connect to other nodes in the network) are assigned to communities to certain arbitrary extent, we implement the algorithm so that all the singletons are put into a separate community. 

The algorithm takes an undirected network in TSV as input, singletons are represented as self-linked edges, as shown in the listing below:

```tsv
Napoleon	Myriel
Mlle.Baptistine	Myriel
Mme.Magloire	Myriel
Mme.Magloire	Mlle.Baptistine
CountessdeLo	Myriel
Geborand	Myriel
A	A
B	B
```

 and output a hierarchy in JSON, as shown in the listing below:
 
 ```json
 {
  "name": "les mis"
  "children": [
    {
      "children": [
        {
          "children": [
            {
              "children": [
                {"name": "Jondrette"},
                {"name": "Mme.Burgon"}
              ],
              "name": "comm_1_1_1"
            },
            {
              "children": [
                {"name": "Child1"},
                {"name": "Child2"},
                {"name": "Gavroche"}
              ],
              "name": "comm_1_1_2"
            }
          ],
          "name": "comm_1_1"
        },
        ...
 ```
 
 **How to use it?** Download the hicomm.jar file, make sure that your Java version is 1.8+, and the jar file is inside a folder that has two sub-folders "/data" and "/output". Put your TSV network file(s), e.g. lesmis.tsv, in the "/data" folder. In your command-line tool, type
 
 ```sh
 java -jar hicomm.jar lesmis.tsv
 ```
 
the corresponding hierarchy of communities is generated in the "/output" folder.
