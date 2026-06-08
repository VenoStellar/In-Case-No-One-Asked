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
    legacyId,
    "comments": *[_type == "comment" && post._ref == ^._id && !defined(parentComment)] | order(createdAt asc) {
      _id,
      authorName,
      content,
      createdAt,
      legacyId,
      "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
        _id,
        authorName,
        content,
        createdAt,
        legacyId
      }
    }
  },
  "allComments": *[_type == "comment"] | order(createdAt asc, _createdAt asc) {
    _id,
    "post": post->title,
    authorName,
    content,
    createdAt,
    legacyId,
    "parentComment": parentComment->{_id, authorName},
    "replies": *[_type == "comment" && parentComment._ref == ^._id] | order(createdAt asc) {
      _id,
      authorName,
      content,
      createdAt,
      legacyId
    }
  },
  "reactions": *[_type == "reaction"] {
    _id,
    postId,
    heartCount,
    likeCount,
    dislikeCount,
    laughCount,
    teaCount,
    legacyPostId
  }
}`;
