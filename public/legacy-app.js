let isAdmin = false;
let commentCount = 0;
let modalImgSrc = null;
let selectedImageFile = null;
let pendingDeleteId = null;
let pendingCommentDeleteId = null;
window.postStore = {};
const rState = {};

const REACTS = [
  { e: '❤️', l: 'Heart', col: 'heartCount' },
  { e: '👍', l: 'Like', col: 'likeCount' },
  { e: '👎', l: 'Dislike', col: 'dislikeCount' },
  { e: '😂', l: 'Laugh', col: 'laughCount' },
  { e: '👀', l: 'Tea', col: 'teaCount' },
];

async function startLegacyApp() {
  document.getElementById('live-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  loadSavedStyles();
  await loadContentFromSanity();
  applyRole();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLegacyApp);
} else {
  startLegacyApp();
}

async function apiFetch(url, options = {}) {
  const headers = {
    ...(options.body ? { 'content-type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return data;
}

function adminHeaders() {
  const password = sessionStorage.getItem('adminPassword') || '';
  return { 'x-admin-password': password };
}

async function loadContentFromSanity() {
  try {
    const data = await apiFetch('/api/content');
    renderPosts(data.posts || []);
    loadAllReactions(data.reactions || []);
    buildReactions();
    renderPostComments(data.posts || []);
  } catch (e) {
    console.error('Could not load content from Sanity:', e);
    const postsCol = document.getElementById('posts-col');
    if (postsCol) {
      postsCol.innerHTML = '<p style="font-family:var(--fh);color:var(--rule);text-align:center">Could not load Sanity content.</p>';
    }
  }
}

function renderPosts(posts) {
  const postsCol = document.getElementById('posts-col');
  const container = document.getElementById('dynamic-posts');
  if (!postsCol || !container) return;

  postsCol.querySelectorAll('article.post').forEach((article) => article.remove());
  container.innerHTML = '';

  if (!posts.length) {
    container.innerHTML = '<p style="font-family:var(--fh);color:var(--rule);text-align:center">No stories have been published yet.</p>';
    return;
  }

  posts.forEach((post) => {
    const article = createPostArticle(post);
    container.appendChild(article);
  });
}

function createPostArticle(post) {
  const article = document.createElement('article');
  const pid = `post-${post._id}`;
  const bodyId = `pb-${pid}`;
  const commentsId = `pc-${pid}`;
  const commentFormId = `cf-${pid}`;
  const isPinned = Boolean(post.isPinned);
  const tagHtml = post.tag
    ? `<div class="post-tags" style="margin-top:10px"><span class="torn-tag" style="--rot:-1deg">${sx(post.tag)}</span></div>`
    : '';
  const imageHtml = post.imageUrl
    ? `<img src="${sx(post.imageUrl)}" class="post-img" alt="Post image"/><p class="post-img-cap">— image by author —</p>`
    : '';
  const stampHtml = post.stampLabel ? `<div class="stamp" style="--rot:${isPinned ? '6deg' : '-5deg'}">${sx(post.stampLabel)}</div>` : '';

  article.className = 'post';
  article.id = pid;
  article.dataset.expanded = isPinned ? 'true' : 'false';
  article.innerHTML = `${stampHtml}
    <div class="post-cat">✦ ${sx(post.category || 'Dispatch')} ✦</div>
    <h2 class="post-headline">${sx(post.title || '')}</h2>
    <div class="post-byline">
      <span>${sx(post.byline || '')}</span>
      <div class="post-actions" id="pa-${pid}"></div>
    </div>
    ${imageHtml}
    <div class="post-body" id="${bodyId}"${isPinned ? '' : ' style="display:none"'}>${post.bodyHtml || ''}</div>
    ${tagHtml}
    <div class="reactions" data-post="${sx(post._id)}"></div>
    <div class="post-comments-sec">
      <div class="post-comments-head">✦ Replies & Notes ✦</div>
      <div class="post-comments" id="${commentsId}">
        <p style="font-family: var(--fh); font-size: 11px; color: var(--rule); letter-spacing: 1px; text-align: center; padding: 10px 0;">— No replies yet —</p>
      </div>
      <div class="post-comment-form" id="${commentFormId}">
        <div class="form-field">
          <label>Your name</label>
          <input type="text" class="post-cname" placeholder="e.g. Curious Reader" autocomplete="off" />
        </div>
        <div class="form-field">
          <label>Your reply</label>
          <textarea class="post-cmsg" placeholder="Share your thoughts..."></textarea>
        </div>
        <button class="submit-btn" onclick="addPostComment('${pid}')">— Post Reply —</button>
      </div>
    </div>`;

  postStore[pid] = {
    id: post._id,
    cat: post.category || '',
    headline: post.title || '',
    byline: post.byline || '',
    bodyHTML: post.bodyHtml || '',
    tag: post.tag || '',
    imgSrc: post.imageUrl || null,
    comments: post.comments || [],
  };

  refreshActions(pid, isPinned);
  return article;
}

function doLogout() {
  isAdmin = false;
  localStorage.removeItem('isAdmin');
  sessionStorage.removeItem('adminPassword');
  applyRole();
  document.getElementById('customize-panel').classList.remove('open');
}

function applyRole() {
  const adminBadge = document.getElementById('admin-badge');
  const btnNewPost = document.getElementById('btn-new-post');
  const btnStyle = document.getElementById('btn-style');
  const btnLogout = document.getElementById('btn-logout');

  if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-flex' : 'none';
  if (btnNewPost) btnNewPost.style.display = isAdmin ? '' : 'none';
  if (btnStyle) btnStyle.style.display = isAdmin ? '' : 'none';
  if (btnLogout) btnLogout.style.display = isAdmin ? '' : 'none';

  document.querySelectorAll('article.post').forEach((article) => {
    refreshActions(article.id, article.dataset.expanded === 'true');
  });

  document.querySelectorAll('.post-comment, .post-comment-reply').forEach((comment) => {
    const actions = comment.querySelector('.comment-actions');
    if (actions) actions.style.display = isAdmin ? '' : 'none';
  });

  document.querySelectorAll('.comment').forEach((comment) => {
    const actions = comment.querySelector('.comment-actions');
    if (actions) actions.style.display = isAdmin ? '' : 'none';
  });
}

function refreshActions(pid, expanded) {
  const container = document.getElementById('pa-' + pid);
  if (!container) return;
  const bodyEl = document.getElementById('pb-' + pid);
  const isOpen = bodyEl && bodyEl.style.display !== 'none';
  let html = '';

  if (!expanded) {
    html += `<button class="read-more-btn" onclick="toggleBody('pb-${pid}',this)">${isOpen ? 'Collapse ▴' : 'Read more ▾'}</button>`;
  }

  if (isAdmin) {
    html += `<button class="btn btn-edit" onclick="openEditPost('${pid}')">✎ Edit</button>`;
    html += `<button class="btn btn-danger" onclick="confirmDelete('${pid}')">✕ Delete</button>`;
  }

  container.innerHTML = html;
}

function toggleBody(id, btn) {
  const el = document.getElementById(id);
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (btn) btn.textContent = open ? 'Read more ▾' : 'Collapse ▴';
}

function openNewPost() {
  if (!isAdmin) return;
  document.getElementById('edit-id').value = '';
  document.getElementById('pm-title').textContent = '✦ Write a New Story ✦';
  document.getElementById('pm-save-btn').textContent = '— Publish Story —';
  ['p-cat', 'p-title', 'p-byline', 'p-tag'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('rte').innerHTML = '';
  resetImagePicker();
  openModal('post-modal');
  setTimeout(() => document.getElementById('p-title').focus(), 120);
}

function openEditPost(pid) {
  if (!isAdmin) return;
  const post = postStore[pid];
  if (!post) return;

  document.getElementById('edit-id').value = pid;
  document.getElementById('pm-title').textContent = '✎ Edit Story';
  document.getElementById('pm-save-btn').textContent = '— Save Changes —';
  document.getElementById('p-cat').value = post.cat;
  document.getElementById('p-byline').value = post.byline;
  document.getElementById('p-tag').value = post.tag;
  document.getElementById('p-title').value = post.headline;
  document.getElementById('rte').innerHTML = post.bodyHTML;
  modalImgSrc = post.imgSrc || null;

  if (modalImgSrc) {
    document.getElementById('img-prev').innerHTML = `<img src="${sx(modalImgSrc)}" style="width:100%;max-height:130px;object-fit:cover;filter:sepia(40%);border:1px solid var(--rule)"/>`;
    document.getElementById('img-name').textContent = 'Image loaded';
  } else {
    resetImagePicker();
  }

  openModal('post-modal');
  setTimeout(() => document.getElementById('p-title').focus(), 120);
}

async function savePost() {
  if (!isAdmin) return;
  const eid = document.getElementById('edit-id').value;
  const cat = document.getElementById('p-cat').value.trim() || 'Dispatch';
  const title = document.getElementById('p-title').value.trim();
  const byline = document.getElementById('p-byline').value.trim() || `The Editors · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  const bodyHTML = document.getElementById('rte').innerHTML.trim();
  const tag = document.getElementById('p-tag').value.trim();

  if (!title || !bodyHTML) {
    alert('Please add a headline and story body!');
    return;
  }

  try {
    const payload = {
      title,
      category: cat,
      byline,
      bodyHtml: bodyHTML,
      tag,
      imageUrl: modalImgSrc || '',
    };

    if (eid) {
      const postId = postStore[eid].id;
      await apiFetch(`/api/posts/${encodeURIComponent(postId)}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/api/posts', {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
    }

    closeModal('post-modal');
    clearPostForm();
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to save post:', e);
    alert('Failed to save story: ' + e.message);
  }
}

function confirmDelete(pid) {
  if (!isAdmin) return;
  pendingDeleteId = pid;
  openModal('del-modal');
}

async function doDelete() {
  if (!pendingDeleteId) return;
  try {
    const postId = postStore[pendingDeleteId]?.id;
    if (postId) {
      await apiFetch(`/api/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
    }
    pendingDeleteId = null;
    closeModal('del-modal');
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to delete post:', e);
    alert('Failed to delete story: ' + e.message);
  }
}

function loadAllReactions(reactions) {
  reactions.forEach((item) => {
    const pid = item.postId;
    rState[pid] = REACTS.map((react) => ({ n: item[react.col] || 0 }));
  });
}

function buildReactions() {
  document.querySelectorAll('.reactions').forEach((wrap) => buildReactionsForPost(wrap.dataset.post));
}

function buildReactionsForPost(pid) {
  const wrap = document.querySelector(`.reactions[data-post="${cssEscape(pid)}"]`);
  if (!wrap) return;

  if (!rState[pid]) rState[pid] = REACTS.map(() => ({ n: 0 }));
  wrap.innerHTML = '<span class="reactions-label">React:</span>';

  REACTS.forEach((react, index) => {
    const state = rState[pid][index];
    const voted = getVotedReaction(pid) === index;
    const button = document.createElement('button');
    button.className = 'r-btn' + (voted ? ' on' : '');
    button.innerHTML = `<span class="em">${react.e}</span><span class="rc">${state.n}</span>`;
    button.title = voted ? `Remove your ${react.l} reaction` : react.l;
    button.onclick = () => toggleReaction(pid, index);
    wrap.appendChild(button);
  });
}

async function toggleReaction(pid, emojiIdx) {
  const react = REACTS[emojiIdx];
  const currentReaction = getVotedReaction(pid);
  const voted = currentReaction === emojiIdx;
  const previousReaction = currentReaction;
  const previousCounts = rState[pid].map((state) => state.n);
  const state = rState[pid][emojiIdx];

  if (voted && state.n <= 0) return;

  if (voted) {
    state.n = Math.max(0, state.n - 1);
    setVotedReaction(pid, null);
  } else {
    if (previousReaction !== null) {
      rState[pid][previousReaction].n = Math.max(0, rState[pid][previousReaction].n - 1);
    }
    state.n += 1;
    setVotedReaction(pid, emojiIdx);
  }

  buildReactionsForPost(pid);

  try {
    if (voted) {
      await saveReactionDelta(pid, react.col, -1);
    } else {
      if (previousReaction !== null) {
        await saveReactionDelta(pid, REACTS[previousReaction].col, -1);
      }
      await saveReactionDelta(pid, react.col, 1);
    }
  } catch (e) {
    previousCounts.forEach((count, index) => {
      rState[pid][index].n = count;
    });
    setVotedReaction(pid, previousReaction);
    buildReactionsForPost(pid);
    console.error('Failed to save reaction:', e);
  }
}

function saveReactionDelta(pid, field, delta) {
  return apiFetch('/api/reactions', {
    method: 'POST',
    body: JSON.stringify({ postId: pid, field, delta }),
  });
}

function getVotedReactions() {
  try {
    return JSON.parse(localStorage.getItem('votedReactions') || '{}');
  } catch {
    return {};
  }
}

function getVotedReaction(pid) {
  const voted = getVotedReactions();
  const value = voted[pid];

  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const legacyIndex = Object.keys(value).find((key) => value[key]);
    return legacyIndex === undefined ? null : Number(legacyIndex);
  }

  return null;
}

function setVotedReaction(pid, emojiIdx) {
  const voted = getVotedReactions();

  if (emojiIdx === null) {
    delete voted[pid];
  } else {
    voted[pid] = emojiIdx;
  }

  localStorage.setItem('votedReactions', JSON.stringify(voted));
}

function renderPostComments(posts) {
  posts.forEach((post) => {
    const pid = `post-${post._id}`;
    const commentsContainer = document.getElementById(`pc-${pid}`);
    if (!commentsContainer) return;
    
    const comments = post.comments || [];
    commentsContainer.innerHTML = '';
    
    if (!comments.length) {
      commentsContainer.innerHTML = '<p style="font-family: var(--fh); font-size: 11px; color: var(--rule); letter-spacing: 1px; text-align: center; padding: 10px 0;">— No replies yet —</p>';
    } else {
      comments.forEach((comment) => renderPostCommentElement(comment, pid));
    }
  });
}

function renderPostCommentElement(comment, pid) {
  const commentsContainer = document.getElementById(`pc-${pid}`);
  if (!commentsContainer) return;
  
  const div = document.createElement('div');
  div.className = 'post-comment';
  div.id = `postcomment-${comment._id}`;
  div.setAttribute('data-id', comment._id);
  
  const name = comment.authorName || 'Anonymous';
  const msg = comment.content || '';
  const date = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '';
  const deleteBtn = `<button class="comment-del-btn" onclick="openDeleteCommentModal('${comment._id}', '${pid}')">✕</button>`;
  
  let repliesHtml = '';
  if (comment.replies && comment.replies.length > 0) {
    repliesHtml = '<div class="post-comment-replies">';
    comment.replies.forEach((reply) => {
      const replyName = reply.authorName || 'Anonymous';
      const replyMsg = reply.content || '';
      const replyDate = reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : '';
      const replyDeleteBtn = `<button class="comment-del-btn" onclick="openDeleteCommentModal('${reply._id}', '${pid}')">✕</button>`;
      
      repliesHtml += `<div class="post-comment-reply" id="postcomment-${reply._id}" data-id="${reply._id}">
        <div class="cmeta">
          <div style="flex:1"><span><strong>↳ ${sx(replyName)}</strong></span><span style="opacity:.6;margin-left:6px;">${sx(replyDate)}</span></div>
          <div class="comment-actions" style="display:${isAdmin ? '' : 'none'}">${replyDeleteBtn}</div>
        </div>
        <div class="ctext">${sx(replyMsg)}</div>
      </div>`;
    });
    repliesHtml += '</div>';
  }
  
  div.innerHTML = `<div class="cmeta"><div style="flex:1"><span><strong>${sx(name)}</strong></span><span style="opacity:.6;margin-left:6px;">${sx(date)}</span></div><div class="comment-actions" style="display:${isAdmin ? '' : 'none'}">${deleteBtn}</div></div><div class="ctext">${sx(msg)}</div>${repliesHtml}<button class="reply-btn" onclick="toggleReplyForm(this, '${comment._id}', '${pid}')">↳ Reply</button>`;
  
  commentsContainer.appendChild(div);
}

function toggleReplyForm(btn, commentId, pid) {
  let replyForm = btn.parentElement.querySelector('.post-reply-form');
  if (!replyForm) {
    const container = btn.parentElement;
    replyForm = document.createElement('div');
    replyForm.className = 'post-reply-form';
    replyForm.innerHTML = `<div class="form-field">
      <input type="text" class="reply-cname" placeholder="Your name..." autocomplete="off" />
    </div>
    <div class="form-field">
      <textarea class="reply-cmsg" placeholder="Your reply..."></textarea>
    </div>
    <button class="submit-btn" style="font-size: 11px; padding: 6px 10px;" onclick="addPostReply('${pid}', '${commentId}')">— Post Reply —</button>`;
    container.insertBefore(replyForm, btn);
    btn.textContent = '✕ Cancel';
  } else {
    replyForm.remove();
    btn.textContent = '↳ Reply';
  }
}

function renderComments(comments) {
  const container = document.getElementById('comments-container');
  if (!container) return;
  container.innerHTML = '';

  if (!comments.length) {
    container.innerHTML = '<p style="font-size:11px;color:var(--smudge);font-style:italic;text-align:center">The silence is deafening. Say something.</p>';
  } else {
    comments.forEach((comment, index) => renderCommentElement(comment, index));
  }

  const ccount = document.getElementById('ccount');
  if (ccount) ccount.textContent = comments.length;
  commentCount = comments.length;
}

function renderCommentElement(comment, idx) {
  const container = document.getElementById('comments-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'comment';
  div.id = 'comment-' + idx;
  div.setAttribute('data-code', comment._id);

  const name = comment.authorName || 'Anonymous';
  const msg = comment.content || '';
  const date = comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '';
  const deleteBtn = `<button class="comment-del-btn" onclick="openDeleteCommentModal('${idx}')">✕</button>`;

  div.innerHTML = `<div class="cmeta"><div style="flex:1"><span>${sx(name)}</span><span style="opacity:.6;margin-left:6px;">${sx(date)}</span></div><div class="comment-actions" style="display:${isAdmin ? '' : 'none'}">${deleteBtn}</div></div><div class="ctext">${sx(msg)}</div>`;
  container.appendChild(div);
}

async function addPostComment(pid) {
  const nameInput = document.querySelector(`#cf-${pid} .post-cname`);
  const msgInput = document.querySelector(`#cf-${pid} .post-cmsg`);
  const name = nameInput.value.trim();
  const msg = msgInput.value.trim();
  const postId = postStore[pid]?.id;

  if (!name || !msg || !postId) {
    alert('Please fill in your name and message!');
    return;
  }

  try {
    await apiFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ 
        authorName: name, 
        content: msg,
        postId: postId,
      }),
    });
    nameInput.value = '';
    msgInput.value = '';
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to add comment:', e);
    alert('Failed to save reply: ' + e.message);
  }
}

async function addPostReply(pid, parentCommentId) {
  const replyForm = document.querySelector(`#post-${postStore[pid].id}`).querySelector('.post-reply-form');
  if (!replyForm) return;
  
  const nameInput = replyForm.querySelector('.reply-cname');
  const msgInput = replyForm.querySelector('.reply-cmsg');
  const name = nameInput.value.trim();
  const msg = msgInput.value.trim();
  const postId = postStore[pid]?.id;

  if (!name || !msg || !postId) {
    alert('Please fill in your name and message!');
    return;
  }

  try {
    await apiFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ 
        authorName: name, 
        content: msg,
        postId: postId,
        parentCommentId: parentCommentId,
      }),
    });
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to add reply:', e);
    alert('Failed to save reply: ' + e.message);
  }
}

async function addComment() {
  const nameInput = document.getElementById('cname');
  const msgInput = document.getElementById('cmsg');
  const name = nameInput.value.trim();
  const msg = msgInput.value.trim();

  if (!name || !msg) {
    alert('Please fill in your name and a message!');
    return;
  }

  try {
    await apiFetch('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ authorName: name, content: msg }),
    });
    nameInput.value = '';
    msgInput.value = '';
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to add comment:', e);
    alert('Failed to save comment: ' + e.message);
  }
}

function openDeleteCommentModal(commentId, pid) {
  if (!isAdmin) return;
  pendingCommentDeleteId = commentId;
  openModal('del-comment-modal');
}

async function doDeleteComment() {
  if (pendingCommentDeleteId === null || pendingCommentDeleteId === undefined) return;

  try {
    const id = pendingCommentDeleteId;
    if (id) {
      await apiFetch(`/api/comments/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
    }
    pendingCommentDeleteId = null;
    closeModal('del-comment-modal');
    await loadContentFromSanity();
  } catch (e) {
    console.error('Failed to delete comment:', e);
    alert('Failed to delete comment: ' + e.message);
  }
}

function prevImg(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  selectedImageFile = file;
  document.getElementById('img-name').textContent = file.name;

  const reader = new FileReader();
  reader.onload = (event) => {
    modalImgSrc = event.target.result;
    document.getElementById('img-prev').innerHTML = `<img src="${event.target.result}" style="width:100%;max-height:130px;object-fit:cover;filter:sepia(40%);border:1px solid var(--rule)"/>`;
  };
  reader.readAsDataURL(file);
}

function ev(e) {
  e.preventDefault();
}

function cmd(command, value) {
  const rte = document.getElementById('rte');
  if (rte) {
    rte.focus();
    document.execCommand(command, false, value || null);
  }
}

function wrapSz(cls) {
  const editor = document.getElementById('rte');
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) return;
  stripSz();
  const range = selection.getRangeAt(0);
  const span = document.createElement('span');
  span.className = cls;
  try {
    range.surroundContents(span);
  } catch (_) {
    document.execCommand('insertHTML', false, `<span class="${cls}">${range.toString()}</span>`);
  }
}

function stripSz() {
  const editor = document.getElementById('rte');
  if (!editor) return;
  editor.focus();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  editor.querySelectorAll('.sz-sm,.sz-lg,.sz-xl').forEach((span) => {
    if (selection.containsNode(span, true)) {
      const parent = span.parentNode;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    }
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

document.querySelectorAll('.overlay').forEach((overlay) => {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.classList.remove('open');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach((modal) => modal.classList.remove('open'));
  }
});

function toggleCustomize() {
  const el = document.getElementById('customize-panel');
  if (el) el.classList.toggle('open');
}

function setVar(name, value) {
  document.documentElement.style.setProperty(name, value);
  const styles = getSavedStyles();
  styles[name] = value;
  localStorage.setItem('siteStyles', JSON.stringify(styles));
}

function getSavedStyles() {
  try {
    return JSON.parse(localStorage.getItem('siteStyles') || '{}');
  } catch {
    return {};
  }
}

function loadSavedStyles() {
  const styles = getSavedStyles();
  Object.entries(styles).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
    const inputs = document.querySelectorAll('.customize-panel input[type=color], .customize-panel select');
    inputs.forEach((input) => {
      const onchange = input.getAttribute('onchange') || '';
      if (onchange.includes(name)) input.value = value;
    });
  });
}

function clearPostForm() {
  ['p-cat', 'p-title', 'p-byline', 'p-tag'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('rte').innerHTML = '';
  resetImagePicker();
}

function resetImagePicker() {
  document.getElementById('img-prev').innerHTML = '';
  document.getElementById('img-name').textContent = 'No file chosen';
  document.getElementById('modal-img').value = '';
  modalImgSrc = null;
  selectedImageFile = null;
}

function cssEscape(value) {
  if (window.CSS && window.CSS.escape) return window.CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}

function sx(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
