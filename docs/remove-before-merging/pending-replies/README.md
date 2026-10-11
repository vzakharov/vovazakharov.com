# Replies not yet posted on #140

Each `<comment-id>.md` here is a reply to the review thread whose root comment
has that id, drafted while the operator had a review pending on the shared
account (GitHub answers 422 then). Once that review is submitted, post each and
delete its file:

```bash
cd docs/remove-before-merging/pending-replies
for f in 4*.md; do id=${f%.md}
  gh api repos/vzakharov/vovazakharov.com/pulls/140/comments/$id/replies \
    -F body=@$f --jq .id && git rm -q "$f"
done
```

| File          | Thread                                    |
| ------------- | ----------------------------------------- |
| 4242644434.md | T22 `.claude/rules/reflections.md`        |
| 4242659531.md | T25 `albums/prototypes.md`                |
| 4242661791.md | T26 `artists/poluzhivye.md`               |
| 4242685893.md | T31 `spectrograms/in-our-image.png`       |
| 4242781262.md | T45 `ultimate-abstraction.reflections.md` |
| 4242676250.md | T28 `300000-years.reflections.md`         |
| 4242706511.md | T35 `grand-finale.reflections.md`         |
| 4242669692.md | T27 `300000-years.reflections.md`         |
| 4242678693.md | T29 `believe-in-me.reflections.md`        |
| 4242689334.md | T32 `believe-in-me.reflections.md`        |
| 4242705463.md | T34 `grand-finale.reflections.md`         |
| 4242707862.md | T36 `grand-finale.reflections.md`         |
| 4242711450.md | T37 `grand-finale.reflections.md`         |
| 4242717432.md | T38 `grand-finale.reflections.md`         |
| 4242729791.md | T40 `in-our-image.reflections.md`         |
| 4242752903.md | T41 `one-day.reflections.md`              |
| 4242761655.md | T42 `one-day.reflections.md`              |
| 4242764756.md | T43 `ultimate-abstraction.reflections.md` |
| 4242776207.md | T44 `ultimate-abstraction.reflections.md` |
