/*
  THE STORY SHELF — story list
  ============================
  This is the only file you need to edit to add a story, a series,
  or a "coming soon" book. Every page on the site reads from here.

  Paths are written from the top of the site (no leading slash),
  e.g. "stories/detective-daisy-1/".

  STORY FIELDS
    id        short unique name, lowercase-with-dashes
    title     the book's title
    subtitle  optional second line of the title
    series    optional: the id of a series below
    book      optional: book number inside the series (1, 2, 3...)
    status    "ready" (can be read), "soon" (shows as a wrapped parcel),
              or "hidden" (not shown anywhere)
    path      folder of the story page (only needed when status is "ready")
    cover     optional picture for the cover (svg, png or jpg)
    emoji     used on the cover when there is no picture
    color     cover colour
    blurb     one or two sentences about the story
    published "YYYY-MM-DD" — the day the book went on the shelf (needed for every "ready" story).
              It shows as "Published 11 September 2026" on the shelf, the series page and the
              book's title page, and the newest published story is featured on the home page.

  Adding a new book? Follow the checklist in .genAiDoc/new-book-checklist.md.
*/

window.LIBRARY = {
  site: {
    name: "Read Aloud Akie",
    author: "Akie",   // use a first name or pen name only
    tagline: "Stories read aloud by Akie — pick a book and enjoy.",
  },

  series: [
    {
      id: "detective-daisy",
      title: "Detective Daisy",
      blurb: "Daisy the duck solves mysteries in Happy City with her magnifying glass and a lot of bravery.",
      color: "#4f7f3f",
      badge: "assets/daisy-portrait.svg",
    },
  ],

  stories: [
    {
      id: "missing-lucky-carrot",
      title: "Detective Daisy",
      subtitle: "and the Mystery of the Missing Lucky Carrot",
      series: "detective-daisy",
      book: 1,
      status: "ready",
      path: "stories/detective-daisy-1/",
      cover: "stories/detective-daisy-1/cover.svg",
      color: "#4f7f3f",
      blurb: "Rebecca the bunny's lucky carrot has gone missing. Daisy follows the clues from a horse barn all the way to Lava Volcano.",
      chapters: 5,
      published: "2026-09-11",
    },
    {
      id: "night-owl-woods",
      title: "Detective Daisy",
      subtitle: "and the Night Owl Woods Camping Trip",
      series: "detective-daisy",
      book: 2,
      status: "ready",
      path: "stories/detective-daisy-2/",
      cover: "stories/detective-daisy-2/cover.svg",
      color: "#3f6f4e",
      blurb: "Daisy goes camping in Night Owl Woods. When the trees she chops trap her inside, only a kind friend can find her.",
      chapters: 5,
      published: "2026-09-12",
    },
    {
      id: "new-story",
      title: "A brand-new story",
      status: "soon",
      emoji: "✏️",
      color: "#3f6fa0",
      blurb: "Being written right now.",
    },
    {
      // Example story made with the reusable story template. Change status to "ready" to show it.
      id: "template-example",
      title: "My Story Title",
      status: "hidden",
      path: "stories/_template/",
      emoji: "🌈",
      color: "#b0487a",
      blurb: "A starter story page you can copy for new stories.",
      published: "2026-09-11",
    },
  ],
};
