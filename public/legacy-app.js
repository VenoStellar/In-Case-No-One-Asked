const ADMIN_PASS = 'icnoa2026';

let isAdmin = localStorage.getItem('isAdmin') === 'true';
let commentCount = 0;
let modalImgSrc = null;
let selectedImageFile = null;
let pendingDeleteId = null;
let pendingCommentDeleteId = null;
const postStore = {};
const rState = {};

const REACTS = [
  { e: '🔥', l: 'Fire', col: 'fireCount' },
  { e: '💀', l: 'Dead', col: 'deadCount' },
  { e: '😤', l: 'Preach', col: 'preachCount' },
  { e: '🤌', l: 'Perfect', col: 'perfectCount' },
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
    renderComments(data.comments || []);
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
    <div class="reactions" data-post="${sx(post._id)}"></div>`;

  postStore[pid] = {
    id: post._id,
    cat: post.category || '',
    headline: post.title || '',
    byline: post.byline || '',
    bodyHTML: post.bodyHtml || '',
    tag: post.tag || '',
    imgSrc: post.imageUrl || null,
  };

  refreshActions(pid, isPinned);
  return article;
}

function doLogin() {
  const pw = document.getElementById('login-pw').value;
  if (pw === ADMIN_PASS) {
    isAdmin = true;
    localStorage.setItem('isAdmin', 'true');
    sessionStorage.setItem('adminPassword', pw);
    closeModal('login-modal');
    document.getElementById('login-pw').value = '';
    document.getElementById('login-error').style.display = 'none';
    applyRole();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-pw').select();
  }
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
  const btnLogin = document.getElementById('btn-login');

  if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-flex' : 'none';
  if (btnNewPost) btnNewPost.style.display = isAdmin ? '' : 'none';
  if (btnStyle) btnStyle.style.display = isAdmin ? '' : 'none';
  if (btnLogout) btnLogout.style.display = isAdmin ? '' : 'none';
  if (btnLogin) btnLogin.style.display = isAdmin ? 'none' : '';

  document.querySelectorAll('article.post').forEach((article) => {
    refreshActions(article.id, article.dataset.expanded === 'true');
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
    const voted = hasVoted(pid, index);
    const button = document.createElement('button');
    button.className = 'r-btn' + (voted ? ' on' : '');
    button.innerHTML = `<span class="em">${react.e}</span><span class="rc">${state.n}</span>`;
    button.title = voted ? `${react.l} (already reacted)` : react.l;
    button.onclick = () => toggleReaction(pid, index);
    wrap.appendChild(button);
  });
}

async function toggleReaction(pid, emojiIdx) {
  if (hasVoted(pid, emojiIdx)) return;

  const state = rState[pid][emojiIdx];
  state.n += 1;
  setVotedReaction(pid, emojiIdx);
  buildReactionsForPost(pid);

  try {
    const payload = { postId: pid };
    REACTS.forEach((react, index) => {
      payload[react.col] = rState[pid][index].n;
    });
    await apiFetch('/api/reactions', { method: 'POST', body: JSON.stringify(payload) });
  } catch (e) {
    console.error('Failed to save reaction:', e);
  }
}

function getVotedReactions() {
  try {
    return JSON.parse(localStorage.getItem('votedReactions') || '{}');
  } catch {
    return {};
  }
}

function setVotedReaction(pid, emojiIdx) {
  const voted = getVotedReactions();
  if (!voted[pid]) voted[pid] = {};
  voted[pid][emojiIdx] = true;
  localStorage.setItem('votedReactions', JSON.stringify(voted));
}

function hasVoted(pid, emojiIdx) {
  const voted = getVotedReactions();
  return Boolean(voted[pid] && voted[pid][emojiIdx]);
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

function openDeleteCommentModal(idx) {
  if (!isAdmin) return;
  pendingCommentDeleteId = idx;
  openModal('del-comment-modal');
}

async function doDeleteComment() {
  if (pendingCommentDeleteId === null || pendingCommentDeleteId === undefined) return;

  try {
    const commentEl = document.getElementById('comment-' + pendingCommentDeleteId);
    const id = commentEl ? commentEl.getAttribute('data-code') : null;
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
