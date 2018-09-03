# Data Specification

Here we detail the input data specifications for D-Explorer.

We make D-Explorer more generic by specifying a simple data format, in which any data can be visualized by the tool. The format follows the CSV (Comma Separated Values) convention. An example is shown below. The first row is the header, with the names `aset`, `bset`, `class`, `confidence` and `measure`. `aset` and `bset` columns contain the attribute-value items in the classification rules. Within one set, the items are separated by `SPACE`. The reason we differentiate between A set and B set is to accommodate the output of [DCUBE](http://enforce.di.unipi.it/doku.php/dcube/dcube), where A set is the items marked by the user as Potentially Discriminatory (PD) items, the remaining items as B set --- Potentially Non Discriminatory (PND) items. When there is no need to differentiate two, either the `aset` or `bset` column can be left empty. Each data row represents a classification rule. The `confidence` field stores the confidence of the rule, the `measure' field stores any other measure of the rule, e.g. *lift* or *slift* in DCUBE.


```csv
aset,bset,class,confidence,measure
A1=A1_1,B1=B1_1 B2=B2_1,CLASS=C1,0.53,7.01
A1=A1_2,B1=B1_2 B3=B3_1,CLASS=C1,0.66,6.23
,B2=B2_1 B3=B3_1,CLASS=C2,0.35,6.17
A2=A2_3 A3=A3_1,,CLASS=C3,0.20,1.46	      
```
