# avtarfr.github.io

Personal website of Sumangalam Avtar Sharma, BS-MS student in Mathematics at IISER Pune.
Live at **https://avtarfr.github.io**.

The site is built with [Jekyll](https://jekyllrb.com) and deployed by GitHub Pages on every push to `main`.
There is no build step to run before pushing.

## Structure

```
.
├── _config.yml          Site settings: name, contact details, KaTeX version
├── _data/               Content that pages are generated from
│   ├── projects.yml     Projects (homepage list and projects page)
│   ├── courses.yml      Coursework (homepage summary and CV page)
│   ├── repos.yml        Repositories in the Code section
│   ├── interests.yml    Academic interest cards
│   ├── activities.yml   Activities on the CV page
│   └── navigation.yml   Header links
├── _includes/           Shared pieces: <head>, header, footer, icons, equations
├── _layouts/
│   └── default.html     Page skeleton used by every page
├── assets/
│   ├── css/style.css
│   ├── js/main.js       Theme toggle, math rendering, copy buttons, contact form, GitHub stats
│   ├── img/             Portrait, avatar, link-preview image
│   └── cv.pdf
├── writeups/            Longer project writeups
├── index.html           Homepage
├── projects.html        Project catalog
├── cv.html              CV and full course list
└── 404.html
```

## Editing content

Most changes only touch `_data/`:

- **Add a project:** add an entry to `_data/projects.yml` (newest first). Set `featured: true` to show it on the homepage. The comment at the top of the file lists every field.
- **Add a course:** add it under the right group in `_data/courses.yml`. Add `home: true` to also show it on the homepage.
- **Update the CV:** replace `assets/cv.pdf`.
- **Add a writeup:** copy `writeups/lorenz96.html`, change the front matter at the top, and link it from the project's `links` in `projects.yml`.

Text in the data files is HTML, so write `&` as `&amp;`. Math uses KaTeX: `$...$` inline and `$$...$$` for display.

The "Last updated" date in the footer and the cache-busting version on CSS/JS are set automatically at build time.

## Running locally

Requires Ruby and Bundler.

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000. The `github-pages` gem pins the same Jekyll version and plugins that GitHub Pages uses.
