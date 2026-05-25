export const seedPosts = [
  {
    _id: 'post-static-1',
    _type: 'post',
    title: 'Nobody Asked, We Told You Anyway',
    category: 'Origin Story',
    byline: 'By The Editors · April 30, 2026',
    bodyHtml: `Two writers — armed with nothing but unsolicited
                            opinions, a moderate understanding of HTML, and an
                            alarming number of strong feelings about things
                            nobody brought up — decided that the world needed
                            another blog. The world did not ask. We published
                            anyway. This is, in fact, the founding philosophy of
                            everything you are about to read. We have opinions
                            on your favourite films, your breakfast choices, the
                            way society is going, and whether pineapple belongs
                            on pizza
                            <strong
                                >(it does, and we will not be debating
                                this).</strong
                            >
                            You did not request any of this. That has never
                            stopped us before, and it will not stop us now.
                            <em>Welcome to In Case No One Asked.</em> You're
                            here now. Might as well read.`,
    tag: 'First Issue',
    isPublished: true,
    isPinned: true,
    stampLabel: 'PINNED',
    publishedAt: '2026-04-30T12:00:00.000Z',
    sortOrder: 10,
    legacyId: 'post-1',
  },
  {
    _id: 'post-static-2',
    _type: 'post',
    title: 'On the Virtues of Having a Blog Nobody Reads (Yet)',
    category: 'Culture',
    byline: 'A Meditation on Obscurity · Apr 30, 2026',
    bodyHtml: `There is a quiet dignity in shouting into the void.
                            The void, after all, never talks back. Your hit
                            counter reads "3" and two of those were you,
                            refreshing in incognito mode to check if the font
                            loaded. The third was a web crawler from a country
                            that doesn't exist anymore. And yet — you wrote. You
                            published. You told the algorithm:
                            <strong>I AM HERE.</strong> The algorithm did not
                            respond. You published again anyway. That is the
                            spirit of <em>In Case No One Asked.</em>`,
    isPublished: true,
    publishedAt: '2026-04-30T12:01:00.000Z',
    sortOrder: 20,
    legacyId: 'post-2',
  },
  {
    _id: 'post-static-3',
    _type: 'post',
    title: 'Fonts Are a Personality: A Defense of Too Many Typefaces',
    category: 'Opinion',
    byline: 'Editorial · Apr 30, 2026',
    bodyHtml: `Some designers say consistency is key. Those people
                            have never felt the primal joy of mixing a serif, a
                            monospace, and a novelty display font in a single
                            headline — and <em>feeling</em>, truly feeling, that
                            it works.
                            <strong
                                >This is not chaos. This is character.</strong
                            >
                            You didn't ask for this opinion. You have it now.`,
    isPublished: true,
    stampLabel: 'HOT TAKE',
    publishedAt: '2026-04-30T12:02:00.000Z',
    sortOrder: 30,
    legacyId: 'post-3',
  },
];

export const seedReactions = seedPosts.map((post) => ({
  _id: `reaction-${post._id}`,
  _type: 'reaction',
  postId: post._id,
  legacyPostId: post.legacyId,
  fireCount: 0,
  deadCount: 0,
  preachCount: 0,
  perfectCount: 0,
  teaCount: 0,
}));

export const seedComments = [];

export const seedDocuments = [...seedPosts, ...seedReactions, ...seedComments];
