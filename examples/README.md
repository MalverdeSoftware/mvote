# Example item lists

`chks_example.json` is a set of 85 CHKS concepts, from age and grade through substance access. I picked and edited them to read in plain language for youth voting. They come from the full CHKS secondary-data codebook, and `chks_full_feature_reference.csv` in this folder has the longer reference they were drawn from. The file also shows the JSON shape mVote expects: `id`, `label`, and an optional `description`.

A CSV with the same columns works too:

```csv
id,label,description
sleep_quality,Sleep quality,Self-reported sleep quality in the past 30 days
mood,Mood / depressive symptoms,Frequency of low mood in the past 30 days
```
