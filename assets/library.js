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
    added     "YYYY-MM-DD" — the newest ready story is featured on the home page
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
      added: "2026-09-11",
    },
    {
      id: "daisy-book-2",
      title: "Detective Daisy",
      subtitle: "Book 2",
      series: "detective-daisy",
      book: 2,
      status: "soon",
      emoji: "🔍",
      color: "#4f7f3f",
      blurb: "Daisy's next case is being written.",
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
      added: "2026-09-11",
    },
  ],
};
