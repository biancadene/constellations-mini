# Constellations

A heritage storybook for my son, built as a web app. Each constellation is one line of his ancestry, and each story is a real ancestor, or the culture and folklore that line carries.

Live: [constellations-mini.vercel.app](https://constellations-mini.vercel.app)

## Why it exists

My research project *Beyond the Family Tree* looked at how people preserve family history and pass it on. Respondents kept describing the same thing: a tin or a box of photos with no names, notes or stories attached. The history survived, but the meaning didn't.

Constellations is my design response to that finding. Instead of a tree of names and dates, it gives a child the stories: who these people were, where they lived, what was done to them, and what they did anyway.

Paper: Beyond the Family Tree — [link]

## What's in this snapshot

This public version holds the stories that are finished so far. More will be added as each one's illustrations are redone and its words are verified.

| Constellation | Stories |
|---|---|
| Mi'kmaq | Judith and Barthélemy, Children of Two Worlds · Marie and Anne Marie, Two Grandmothers |
| Canary Islands | Guadarfía, Who Chose His People · Ico, Who Belonged |

The full book also includes more Mi'kmaq and Canary Islands stories, and Wendat, Congo Basin, Aotearoa and Uruguay constellations, still in progress.

## Design decisions

**One book, start to finish.** The open book on a wooden roll-top desk never changes. Only the ornaments at the page corners shift to mark each constellation, so the whole thing reads as a single storybook rather than a set of separate apps.

**Built for print.** Page proportions and layout assume this will one day be a physical book.

**Who tells the story matters.** Many of these ancestors survive only in records written by the people who colonized them. Where a record misnames someone or repeats a rumor about them, the story says so plainly.

**Languages are woven in, not taught.** Real words appear in the English text. Mi'kmaw: L'nu'k, Mi'kma'ki, Mi'kmawi'simk, wikuom, saqamaw, nukumij, each checked against published Mi'kmaw sources and written in the Francis-Smith orthography. From Lanzarote: Titeroygatra, the island's own name, and Majo, its people, in the forms the historical record preserves. I won't build lessons in a language I don't speak.

**Records first.** Every ancestor story is built from documents (censuses, church records, court records, chronicles), and the text marks what is uncertain.

## Built with

HTML, CSS and vanilla JavaScript · [StPageFlip](https://github.com/Nodlik/StPageFlip) for the page turns · Fraunces typeface

```
index.html       layout, book and page styles
app.js           cover, browsing pages, story loading
stories-data.js  every story's text, images and metadata
```

## Status

Development continues in a private repository; this repo is a public snapshot.

---

Bianca Dené Williams · educator and researcher stepping into UX/UI design
