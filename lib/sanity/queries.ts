export const contentQuery = `{
  "posts": *[_type == "post" && isPublished == true] | order(sortOrder asc, publishedAt desc, _createdAt desc) {
    _id,
    title,
    category,
    byline,
    bodyHtml,
    tag,
    imageUrl,
    isPinned,
    stampLabel,
    publishedAt,
    sortOrder,
    legacyId
  },
  "comments": *[_type == "comment"] | order(createdAt asc, _createdAt asc) {
    _id,
    authorName,
    content,
    createdAt,
    legacyId
  },
  "reactions": *[_type == "reaction"] {
    _id,
    postId,
    fireCount,
    deadCount,
    preachCount,
    perfectCount,
    teaCount,
    legacyPostId
  }
}`;
