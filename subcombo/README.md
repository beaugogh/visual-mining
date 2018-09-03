# *subcombo* for Subgroup Comparison


**subcombo** is a set of data mining algorithms for subgroup discovery via comparison. 

More specifically, the tool takes in a regular tabular dataset, in arff, e.g. as the snippet below shows:


```text
@relation example

@attribute id numeric
@attribute gender {female,male}
@attribute age_category {21-24,33-36,25-28,51-80,17-20,29-32,37-50,13-16}
@attribute relationship {Single,Married,'In a relationship',Engaged}
@attribute privacy {2.0,7-10,3-4,21-64,11-20,5-6}
@attribute pos numeric
@attribute attitude numeric

@data
1,female,21-24,Single,2.0,1,0
2,female,21-24,Single,2.0,1,0
3,female,21-24,Single,2.0,1,0
4,female,21-24,Single,2.0,1,0
5,female,21-24,Single,2.0,1,0
```
In the input dataset, each row is an instance, each column is an attribute. There need to be nominal attributes such as the attributes "gender" and "age_category", which the tool uses to construct "combination" of attribute-values to describe a subgroup. There also need to be numerical attribute(s) that the tool uses to compare different subgroups, such as the attribute "pos".

Significantly different subgroup comparisons are identified and output to the format below:
 
 ```text
(female, 17-20, Single) < (female, 17-20, In a relationship), p = 0.0455
(female, 21-24) < (female, 25-28), p = 0.0031
(female, 21-24) < (female, 17-20), p = 0
(female, 21-24) > (female, 37-50), p = 0.0076
(female, 25-28) < (female, 17-20), p = 0.0057
(female, 25-28) > (female, 37-50), p = 0.0006
(female, 17-20) > (female, 29-32), p = 0.023
...
 ```

