/* ═══════════════════════════════════════════════════════════════════
   ★  SUPABASE CONFIG  ★
   ═══════════════════════════════════════════════════════════════════ */
            const SUPABASE_URL = "https://ewbuqklwkewybsqfdlew.supabase.co";
            const SUPABASE_ANON_KEY =
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YnVxa2x3a2V3eWJzcWZkbGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NjMyNjgsImV4cCI6MjA5NTAzOTI2OH0.7qO298Y5IbrzWLddRTdQCftWnY1mABnVJZe2hlgSmEM";
            const ADMIN_PASS = "icnoa2026"; // Change this to your secure password

            /* ═══════════════════════════════════════════════════════════════════
   ★  GLOBAL STATE  ★
   ═══════════════════════════════════════════════════════════════════ */
            let supabaseClient = null;
            let isAdmin = localStorage.getItem("isAdmin") === "true"; // FIX: localStorage persists across sessions
            let postCount = 3;
            let commentCount = 0;
            let sessionCount = 0;
            let modalImgSrc = null;
            let selectedImageFile = null;
            let pendingDeleteId = null;
            let pendingCommentDeleteId = null;
            const postStore = {};
            const rState = {};

            /* ═══════════════════════════════════════════════════════════════════
   ★  INITIALIZE SUPABASE  ★
   ═══════════════════════════════════════════════════════════════════ */
            function initSupabase() {
                if (window.supabase) {
                    supabaseClient = window.supabase.createClient(
                        SUPABASE_URL,
                        SUPABASE_ANON_KEY,
                    );
                    console.log("✓ Supabase initialized");
                } else {
                    console.warn(
                        "⚠ Supabase library not loaded - using local storage only",
                    );
                }
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  STARTUP  ★
   ═══════════════════════════════════════════════════════════════════ */
            async function startLegacyApp() {
                document.getElementById("live-date").textContent =
                    new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });

                initSupabase();
                isAdmin = localStorage.getItem("isAdmin") === "true"; // Restore admin state
                loadSavedStyles(); // FIX: restore saved style customization
                await loadPostsFromSupabase();
                seedPostStore();
                applyRole();
                await loadAllReactionsFromSupabase();
                buildReactions();
                loadComments();
                subscribeToComments(); // FIX: real-time comments for all visitors
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLegacyApp);
} else {
    startLegacyApp();
}

            /* ═══════════════════════════════════════════════════════════════════
   ★  ADMIN AUTH  ★
   ═══════════════════════════════════════════════════════════════════ */
            function doLogin() {
                const pw = document.getElementById("login-pw").value;
                if (pw === ADMIN_PASS) {
                    isAdmin = true;
                    localStorage.setItem("isAdmin", "true"); // FIX: use localStorage
                    closeModal("login-modal");
                    document.getElementById("login-pw").value = "";
                    document.getElementById("login-error").style.display =
                        "none";
                    applyRole();
                } else {
                    document.getElementById("login-error").style.display =
                        "block";
                    document.getElementById("login-pw").select();
                }
            }

            function doLogout() {
                isAdmin = false;
                localStorage.removeItem("isAdmin"); // FIX: use localStorage
                applyRole();
                document
                    .getElementById("customize-panel")
                    .classList.remove("open");
            }

            function applyRole() {
                const adminBadge = document.getElementById("admin-badge");
                const btnNewPost = document.getElementById("btn-new-post");
                const btnStyle = document.getElementById("btn-style");
                const btnLogout = document.getElementById("btn-logout");
                const btnLogin = document.getElementById("btn-login");

                if (adminBadge)
                    adminBadge.style.display = isAdmin ? "inline-flex" : "none";
                if (btnNewPost)
                    btnNewPost.style.display = isAdmin ? "" : "none";
                if (btnStyle) btnStyle.style.display = isAdmin ? "" : "none";
                if (btnLogout) btnLogout.style.display = isAdmin ? "" : "none";
                if (btnLogin) btnLogin.style.display = isAdmin ? "none" : "";

                document
                    .querySelectorAll("article.post")
                    .forEach((a) =>
                        refreshActions(a.id, a.dataset.expanded === "true"),
                    );
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  POST MANAGEMENT  ★
   ═══════════════════════════════════════════════════════════════════ */
            async function loadPostsFromSupabase() {
                try {
                    if (!supabaseClient) return;
                    const { data } = await supabaseClient
                        .from("posts")
                        .select("*")
                        .order("created_at", { ascending: false });
                    if (data && data.length > 0) {
                        const container =
                            document.getElementById("dynamic-posts");
                        data.forEach((post, idx) => {
                            const pid = post.id;
                            postStore[pid] = {
                                id: post.id,
                                cat: post.category || "",
                                headline: post.title || "",
                                byline: post.byline || "",
                                bodyHTML: post.body_html || "",
                                tag: post.tag || "",
                                imgSrc: post.image_url || null,
                            };
                            const html = `<article class="post" id="post-${pid}">
          <div class="post-cat">✦ ${post.category || ""} ✦</div>
          <h2 class="post-headline">${post.title || ""}</h2>
          <div class="post-byline">
            <span>${post.byline || ""}</span>
            <div class="post-actions" id="pa-post-${pid}"></div>
          </div>
          <div class="post-body" id="pb-post-${pid}">${post.body_html || ""}</div>
          ${post.image_url ? `<img src="${post.image_url}" style="max-width:100%;margin-top:12px"/>` : ""}
          <div class="reactions" data-post="post-${pid}"></div>
        </article>`;
                            if (container) container.innerHTML += html;
                        });
                    }
                } catch (e) {
                    console.log(
                        "Could not load posts from Supabase, using defaults",
                    );
                }
            }

            function seedPostStore() {
                ["post-1", "post-2", "post-3"].forEach((pid) => {
                    const art = document.getElementById(pid);
                    if (!art) return;
                    const bodyEl = document.getElementById("pb-" + pid);
                    const catEl = art.querySelector(".post-cat");
                    const hlEl = art.querySelector(".post-headline");
                    const blEl = art.querySelector(".post-byline > span");
                    postStore[pid] = {
                        cat: (catEl?.textContent || "").replace(/✦|\s/g, ""),
                        headline: hlEl?.innerText || "",
                        byline: blEl?.innerText || "",
                        bodyHTML: bodyEl?.innerHTML || "",
                        tag: "",
                        imgSrc: null,
                    };
                });
                document.getElementById("post-1").dataset.expanded = "true";
            }

            function refreshActions(pid, expanded) {
                const c = document.getElementById("pa-" + pid);
                if (!c) return;
                const bodyEl = document.getElementById("pb-" + pid);
                const isOpen = bodyEl && bodyEl.style.display !== "none";
                let h = "";
                if (!expanded)
                    h += `<button class="read-more-btn" onclick="toggleBody('pb-${pid}',this)">${isOpen ? "Collapse ▴" : "Read more ▾"}</button>`;
                if (isAdmin) {
                    h += `<button class="btn btn-edit" onclick="openEditPost('${pid}')">✎ Edit</button>`;
                    h += `<button class="btn btn-danger" onclick="confirmDelete('${pid}')">✕ Delete</button>`;
                }
                c.innerHTML = h;
            }

            function toggleBody(id, btn) {
                const el = document.getElementById(id);
                if (!el) return;
                const open = el.style.display !== "none";
                el.style.display = open ? "none" : "block";
                if (btn) btn.textContent = open ? "Read more ▾" : "Collapse ▴";
            }

            function openNewPost() {
                if (!isAdmin) return;
                document.getElementById("edit-id").value = "";
                document.getElementById("pm-title").textContent =
                    "✦ Write a New Story ✦";
                document.getElementById("pm-save-btn").textContent =
                    "— Publish Story —";
                ["p-cat", "p-title", "p-byline", "p-tag"].forEach((i) => {
                    const el = document.getElementById(i);
                    if (el) el.value = "";
                });
                const rte = document.getElementById("rte");
                const prev = document.getElementById("img-prev");
                const imgName = document.getElementById("img-name");
                const modal = document.getElementById("modal-img");
                if (rte) rte.innerHTML = "";
                if (prev) prev.innerHTML = "";
                if (imgName) imgName.textContent = "No file chosen";
                if (modal) modal.value = "";
                modalImgSrc = null;
                selectedImageFile = null;
                openModal("post-modal");
                setTimeout(
                    () => document.getElementById("p-title").focus(),
                    120,
                );
            }

            function openEditPost(pid) {
                if (!isAdmin) return;
                const d = postStore[pid];
                if (!d) return;
                document.getElementById("edit-id").value = pid;
                document.getElementById("pm-title").textContent =
                    "✎ Edit Story";
                document.getElementById("pm-save-btn").textContent =
                    "— Save Changes —";
                document.getElementById("p-cat").value = d.cat;
                document.getElementById("p-byline").value = d.byline;
                document.getElementById("p-tag").value = d.tag;
                document.getElementById("p-title").value = d.headline;
                document.getElementById("rte").innerHTML = d.bodyHTML;
                modalImgSrc = d.imgSrc || null;
                if (modalImgSrc) {
                    document.getElementById("img-prev").innerHTML =
                        `<img src="${modalImgSrc}" style="width:100%;max-height:130px;object-fit:cover;filter:sepia(40%);border:1px solid var(--rule)"/>`;
                    document.getElementById("img-name").textContent =
                        "Image loaded";
                } else {
                    document.getElementById("img-prev").innerHTML = "";
                    document.getElementById("img-name").textContent =
                        "No file chosen";
                }
                openModal("post-modal");
                setTimeout(
                    () => document.getElementById("p-title").focus(),
                    120,
                );
            }

            function savePost() {
                if (!isAdmin) return;
                const eid = document.getElementById("edit-id").value;
                const cat =
                    document.getElementById("p-cat").value.trim() || "Dispatch";
                const title = document.getElementById("p-title").value.trim();
                const byline =
                    document.getElementById("p-byline").value.trim() ||
                    "The Editors · " +
                        new Date().toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        });
                const bodyHTML = document
                    .getElementById("rte")
                    .innerHTML.trim();
                const tag = document.getElementById("p-tag").value.trim();

                if (!title || !bodyHTML) {
                    alert("Please add a headline and story body!");
                    return;
                }

                if (eid) {
                    updatePostInSupabase(
                        eid,
                        cat,
                        title,
                        byline,
                        bodyHTML,
                        tag,
                    );
                } else {
                    createPostInSupabase(cat, title, byline, bodyHTML, tag);
                }
            }

            async function createPostInSupabase(
                cat,
                title,
                byline,
                bodyHTML,
                tag,
            ) {
                try {
                    if (!supabaseClient) return;
                    const { data, error } = await supabaseClient
                        .from("posts")
                        .insert([
                            {
                                title,
                                category: cat,
                                byline,
                                body_html: bodyHTML,
                                tag,
                                image_url: modalImgSrc,
                                is_published: true,
                            },
                        ])
                        .select();

                    if (error) throw error;
                    if (data && data[0]) {
                        const pid = data[0].id;
                        const bid = "pb-post-" + pid;
                        const ih = modalImgSrc
                            ? `<img src="${modalImgSrc}" class="post-img" alt="Post image"/><p class="post-img-cap">— image by author —</p>`
                            : "";
                        const th = tag
                            ? `<div class="post-tags"><span class="torn-tag" style="--rot:-1deg">${sx(tag)}</span></div>`
                            : "";

                        const art = document.createElement("article");
                        art.className = "post";
                        art.id = "post-" + pid;
                        art.innerHTML = `
        <div class="post-cat">✦ ${sx(cat)} ✦</div>
        <h2 class="post-headline">${sx(title)}</h2>
        <div class="post-byline">
          <span>${sx(byline)}</span>
          <div class="post-actions" id="pa-post-${pid}"></div>
        </div>
        ${ih}
        <div class="post-body" id="${bid}" style="display:none">${bodyHTML}</div>
        ${th}
        <div class="reactions" data-post="post-${pid}"></div>`;

                        document.getElementById("dynamic-posts").prepend(art);
                        rState["post-" + pid] = REACTS.map(() => ({ n: 0 }));
                        buildReactionsForPost("post-" + pid);
                        refreshActions("post-" + pid, false);
                        postStore["post-" + pid] = {
                            id: pid,
                            cat,
                            headline: title,
                            byline,
                            bodyHTML,
                            tag,
                            imgSrc: modalImgSrc,
                        };
                    }
                } catch (e) {
                    console.error("Failed to create post:", e);
                    alert("Failed to publish post");
                } finally {
                    ["p-cat", "p-title", "p-byline", "p-tag"].forEach((i) => {
                        const el = document.getElementById(i);
                        if (el) el.value = "";
                    });
                    document.getElementById("rte").innerHTML = "";
                    document.getElementById("img-prev").innerHTML = "";
                    document.getElementById("img-name").textContent =
                        "No file chosen";
                    document.getElementById("modal-img").value = "";
                    modalImgSrc = null;
                    selectedImageFile = null;
                    closeModal("post-modal");
                }
            }

            async function updatePostInSupabase(
                eid,
                cat,
                title,
                byline,
                bodyHTML,
                tag,
            ) {
                try {
                    // FIX: only write to DB for dynamic posts (UUID), not static hardcoded ones
                    const postId = eid.replace("post-", "");
                    const isUUID =
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                            postId,
                        );

                    if (supabaseClient && isUUID) {
                        const { error } = await supabaseClient
                            .from("posts")
                            .update({
                                title,
                                category: cat,
                                byline,
                                body_html: bodyHTML,
                                tag,
                                image_url: modalImgSrc,
                            })
                            .eq("id", postId);

                        if (error) throw error;
                    }

                    // FIX: update the DOM regardless of DB (works for static posts too)
                    const art = document.getElementById(eid);
                    if (art) {
                        const catEl = art.querySelector(".post-cat");
                        const hlEl = art.querySelector(".post-headline");
                        const blEl = art.querySelector(".post-byline > span");
                        if (catEl) catEl.textContent = `✦ ${cat} ✦`;
                        if (hlEl) hlEl.textContent = title;
                        if (blEl) blEl.innerHTML = sx(byline);

                        // FIX: body element ID pattern — dynamic posts use "pb-post-UUID", static use "pb-post-N"
                        const bodyEl = document.getElementById("pb-" + eid);
                        if (bodyEl) bodyEl.innerHTML = bodyHTML;

                        if (modalImgSrc) {
                            let img = art.querySelector(".post-img");
                            if (img) {
                                img.src = modalImgSrc;
                            } else {
                                const be =
                                    bodyEl || art.querySelector(".post-body");
                                if (be) {
                                    img = Object.assign(
                                        document.createElement("img"),
                                        {
                                            src: modalImgSrc,
                                            className: "post-img",
                                            alt: "Post image",
                                        },
                                    );
                                    const cap = Object.assign(
                                        document.createElement("p"),
                                        {
                                            className: "post-img-cap",
                                            textContent: "— image by author —",
                                        },
                                    );
                                    be.before(img);
                                    img.after(cap);
                                }
                            }
                        }

                        let td = art.querySelector(".post-tags");
                        if (tag) {
                            if (!td) {
                                td = document.createElement("div");
                                td.className = "post-tags";
                                const reacts = art.querySelector(".reactions");
                                if (reacts) reacts.before(td);
                            }
                            td.innerHTML = `<span class="torn-tag" style="--rot:-1deg">${sx(tag)}</span>`;
                        } else if (td) td.remove();

                        postStore[eid] = {
                            cat,
                            headline: title,
                            byline,
                            bodyHTML,
                            tag,
                            imgSrc: modalImgSrc,
                        };
                    }
                } catch (e) {
                    console.error("Failed to update post:", e);
                    alert("Failed to save changes: " + e.message);
                } finally {
                    ["p-cat", "p-title", "p-byline", "p-tag"].forEach((i) => {
                        const el = document.getElementById(i);
                        if (el) el.value = "";
                    });
                    document.getElementById("rte").innerHTML = "";
                    document.getElementById("img-prev").innerHTML = "";
                    document.getElementById("img-name").textContent =
                        "No file chosen";
                    document.getElementById("modal-img").value = "";
                    modalImgSrc = null;
                    selectedImageFile = null;
                    closeModal("post-modal");
                }
            }

            function confirmDelete(pid) {
                if (!isAdmin) return;
                pendingDeleteId = pid;
                openModal("del-modal");
            }

            async function doDelete() {
                if (!pendingDeleteId) return;
                try {
                    if (supabaseClient) {
                        // FIX: only attempt DB delete if it's a real UUID (dynamic post)
                        const rawId = pendingDeleteId.replace("post-", "");
                        const isUUID =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                                rawId,
                            );
                        if (isUUID) {
                            const { error } = await supabaseClient
                                .from("posts")
                                .delete()
                                .eq("id", rawId);
                            if (error) throw error;
                        }
                        // Also delete its reactions row
                        if (isUUID) {
                            await supabaseClient
                                .from("reactions")
                                .delete()
                                .eq("post_id", rawId);
                        }
                    }
                    const el = document.getElementById(pendingDeleteId);
                    if (el) el.remove();
                    delete postStore[pendingDeleteId];
                    pendingDeleteId = null;
                } catch (e) {
                    console.error("Failed to delete post:", e);
                    alert("Failed to delete post: " + e.message);
                } finally {
                    closeModal("del-modal");
                }
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  REACTIONS  ★
   ═══════════════════════════════════════════════════════════════════ */
            const REACTS = [
                { e: "🔥", l: "Fire", col: "fire_count" },
                { e: "💀", l: "Dead", col: "dead_count" },
                { e: "😤", l: "Preach", col: "preach_count" },
                { e: "🤌", l: "Perfect", col: "perfect_count" },
                { e: "👀", l: "Tea", col: "tea_count" },
            ];

            // FIX: track which reactions this browser has already cast
            function getVotedReactions() {
                try {
                    return JSON.parse(
                        localStorage.getItem("votedReactions") || "{}",
                    );
                } catch {
                    return {};
                }
            }
            function setVotedReaction(pid, emojiIdx) {
                const v = getVotedReactions();
                if (!v[pid]) v[pid] = {};
                v[pid][emojiIdx] = true;
                localStorage.setItem("votedReactions", JSON.stringify(v));
            }
            function hasVoted(pid, emojiIdx) {
                const v = getVotedReactions();
                return !!(v[pid] && v[pid][emojiIdx]);
            }

            async function loadAllReactionsFromSupabase() {
                try {
                    if (!supabaseClient) return;
                    const { data } = await supabaseClient
                        .from("reactions")
                        .select("*");
                    if (data && data.length > 0) {
                        data.forEach((item) => {
                            const pid = item.post_id;
                            if (!rState[pid]) {
                                rState[pid] = REACTS.map(() => ({ n: 0 }));
                            }
                            REACTS.forEach((r, i) => {
                                rState[pid][i] = { n: item[r.col] || 0 };
                            });
                        });
                    }
                } catch (e) {
                    console.log("Could not load reactions from Supabase");
                }
            }

            function buildReactions() {
                document
                    .querySelectorAll(".reactions")
                    .forEach((wrap) =>
                        buildReactionsForPost(wrap.dataset.post),
                    );
            }

            function buildReactionsForPost(pid) {
                const wrap = document.querySelector(
                    `.reactions[data-post="${pid}"]`,
                );
                if (!wrap) return;

                if (!rState[pid]) {
                    rState[pid] = REACTS.map(() => ({ n: 0 }));
                }

                wrap.innerHTML = '<span class="reactions-label">React:</span>';
                REACTS.forEach((r, i) => {
                    const s = rState[pid][i];
                    const voted = hasVoted(pid, i); // FIX: check if user already voted
                    const b = document.createElement("button");
                    b.className = "r-btn" + (voted ? " on" : "");
                    b.innerHTML = `<span class="em">${r.e}</span><span class="rc">${s.n}</span>`;
                    b.title = voted ? `${r.l} (already reacted)` : r.l;
                    b.onclick = () => toggleReaction(pid, i, r.col);
                    wrap.appendChild(b);
                });
            }

            async function toggleReaction(pid, emojiIdx, colName) {
                // FIX: prevent voting more than once
                if (hasVoted(pid, emojiIdx)) return;

                const s = rState[pid][emojiIdx];
                s.n += 1;
                setVotedReaction(pid, emojiIdx); // mark as voted before UI update
                buildReactionsForPost(pid);

                if (supabaseClient) {
                    try {
                        // FIX: resolve actual UUID — for dynamic posts the pid is the UUID, for static it's symbolic
                        const rawId = pid.replace("post-", "");
                        const isUUID =
                            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                                rawId,
                            );
                        if (!isUUID) return; // static posts don't have a DB reactions row yet

                        await supabaseClient.from("reactions").upsert(
                            {
                                post_id: rawId,
                                fire_count: rState[pid][0].n,
                                dead_count: rState[pid][1].n,
                                preach_count: rState[pid][2].n,
                                perfect_count: rState[pid][3].n,
                                tea_count: rState[pid][4].n,
                            },
                            { onConflict: "post_id" },
                        );
                    } catch (e) {
                        console.error("Failed to save reaction:", e);
                    }
                }
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  COMMENTS  ★
   ═══════════════════════════════════════════════════════════════════ */
            function loadComments() {
                if (supabaseClient) {
                    fetchCommentsFromSupabase();
                } else {
                    loadCommentsFromStorage();
                }
            }

            async function fetchCommentsFromSupabase() {
                try {
                    if (!supabaseClient) return;
                    const { data } = await supabaseClient
                        .from("comments")
                        .select("*")
                        .order("created_at", { ascending: true });
                    const container =
                        document.getElementById("comments-container");
                    if (!container) return;

                    container.innerHTML = "";
                    if (!data || data.length === 0) {
                        container.innerHTML =
                            '<p style="font-size:11px;color:var(--smudge);font-style:italic;text-align:center">The silence is deafening. Say something.</p>';
                    } else {
                        data.forEach((c, idx) => {
                            renderCommentElement(c, idx);
                        });
                    }

                    const ccount = document.getElementById("ccount");
                    if (ccount) ccount.textContent = data ? data.length : 0;
                    commentCount = data ? data.length : 0;
                } catch (e) {
                    console.error("Failed to fetch comments from Supabase:", e);
                    loadCommentsFromStorage();
                }
            }

            function loadCommentsFromStorage() {
                const stored = localStorage.getItem("blogComments");
                const comments = stored ? JSON.parse(stored) : [];
                const container = document.getElementById("comments-container");

                if (!container) return;
                container.innerHTML = "";

                if (comments.length === 0) {
                    container.innerHTML =
                        '<p style="font-size:11px;color:var(--smudge);font-style:italic;text-align:center">The silence is deafening. Say something.</p>';
                } else {
                    comments.forEach((c, idx) => {
                        renderCommentElement(c, idx);
                    });
                }

                const ccount = document.getElementById("ccount");
                if (ccount) ccount.textContent = comments.length;
                commentCount = comments.length;
            }

            function renderCommentElement(c, idx) {
                const container = document.getElementById("comments-container");
                if (!container) return;
                const div = document.createElement("div");
                div.className = "comment";
                div.id = "comment-" + idx;
                if (c.id) div.setAttribute("data-code", c.id);

                const name = c.author_name || c.name || "Anonymous";
                const msg = c.content || c.msg;
                const date = c.created_at
                    ? new Date(c.created_at).toLocaleDateString()
                    : c.date;

                let deleteBtn = `<button class="comment-del-btn" onclick="openDeleteCommentModal('${idx}')">✕</button>`;

                div.innerHTML = `<div class="cmeta"><div style="flex:1"><span>${sx(name)}</span><span style="opacity:.6;margin-left:6px;">${date}</span></div><div class="comment-actions">${deleteBtn}</div></div><div class="ctext">${sx(msg)}</div>`;
                container.appendChild(div);
            }

            function addComment() {
                const nameInput = document.getElementById("cname");
                const msgInput = document.getElementById("cmsg");
                const name = nameInput.value.trim();
                const msg = msgInput.value.trim();

                if (!name || !msg) {
                    alert("Please fill in your name and a message!");
                    return;
                }

                const today = new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });

                if (supabaseClient) {
                    addCommentToSupabase(name, msg);
                } else {
                    addCommentToStorage(name, msg, today);
                }

                nameInput.value = "";
                msgInput.value = "";
            }

            async function addCommentToSupabase(name, msg) {
                try {
                    if (!supabaseClient) return;
                    // FIX: removed invalid post_id field — comments table has no post_id column
                    const { error } = await supabaseClient.from("comments").insert([
                        {
                            author_name: name,
                            content: msg,
                        },
                    ]);
                    if (error) {
                        console.error("Insert error:", error);
                        throw error;
                    }
                    // Don't need to manually refresh — real-time subscription handles it
                } catch (e) {
                    console.error("Failed to add comment to Supabase:", e);
                    alert(
                        "Failed to save comment. Retrying with local storage...",
                    );
                    const today = new Date().toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    });
                    addCommentToStorage(name, msg, today);
                }
            }

            /* FIX: Real-time subscription — all visitors see new comments instantly */
            function subscribeToComments() {
                if (!supabaseClient) return;
                supabaseClient
                    .channel("comments-live")
                    .on(
                        "postgres_changes",
                        { event: "*", schema: "public", table: "comments" },
                        () => {
                            fetchCommentsFromSupabase();
                        },
                    )
                    .subscribe();
            }

            function addCommentToStorage(name, msg, date) {
                const stored = localStorage.getItem("blogComments");
                const comments = stored ? JSON.parse(stored) : [];
                comments.push({ name, msg, date });
                localStorage.setItem("blogComments", JSON.stringify(comments));
                loadCommentsFromStorage();
            }

            function openDeleteCommentModal(idx) {
                pendingCommentDeleteId = idx;
                openModal("del-comment-modal");
            }

            async function doDeleteComment() {
                if (!pendingCommentDeleteId && pendingCommentDeleteId !== 0)
                    return;

                try {
                    // Try to delete from Supabase first
                    if (supabaseClient) {
                        const commentEl = document.getElementById(
                            "comment-" + pendingCommentDeleteId,
                        );
                        const dataCode = commentEl
                            ? commentEl.getAttribute("data-code")
                            : null;

                        if (dataCode) {
                            const { error } = await supabaseClient
                                .from("comments")
                                .delete()
                                .eq("id", dataCode);
                            if (error) throw error;
                        }
                    }

                    const commentEl = document.getElementById(
                        "comment-" + pendingCommentDeleteId,
                    );
                    if (commentEl) {
                        commentEl.remove();
                    }

                    // Also remove from storage
                    const stored = localStorage.getItem("blogComments");
                    if (stored) {
                        const comments = JSON.parse(stored);
                        comments.splice(pendingCommentDeleteId, 1);
                        localStorage.setItem(
                            "blogComments",
                            JSON.stringify(comments),
                        );
                    }

                    // Update count
                    const container =
                        document.getElementById("comments-container");
                    const commentEls = container.querySelectorAll(".comment");
                    const ccount = document.getElementById("ccount");
                    if (ccount) ccount.textContent = commentEls.length;
                } catch (e) {
                    console.error("Failed to delete comment:", e);
                    alert("Failed to delete comment");
                } finally {
                    pendingCommentDeleteId = null;
                    closeModal("del-comment-modal");
                }
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  IMAGE HANDLING  ★
   ═══════════════════════════════════════════════════════════════════ */
            function prevImg(ev) {
                const f = ev.target.files[0];
                if (!f) return;

                selectedImageFile = f;
                document.getElementById("img-name").textContent = f.name;

                const r = new FileReader();
                r.onload = (e) => {
                    modalImgSrc = e.target.result;
                    document.getElementById("img-prev").innerHTML =
                        `<img src="${e.target.result}" style="width:100%;max-height:130px;object-fit:cover;filter:sepia(40%);border:1px solid var(--rule)"/>`;
                };
                r.readAsDataURL(f);
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  RICH TEXT EDITOR  ★
   ═══════════════════════════════════════════════════════════════════ */
            function ev(e) {
                e.preventDefault();
            }

            function cmd(c, v) {
                const rte = document.getElementById("rte");
                if (rte) {
                    rte.focus();
                    document.execCommand(c, false, v || null);
                }
            }

            function wrapSz(cls) {
                const ed = document.getElementById("rte");
                if (!ed) return;
                ed.focus();
                const sel = window.getSelection();
                if (!sel.rangeCount || sel.isCollapsed) return;
                stripSz();
                const range = sel.getRangeAt(0);
                const span = document.createElement("span");
                span.className = cls;
                try {
                    range.surroundContents(span);
                } catch (_) {
                    document.execCommand(
                        "insertHTML",
                        false,
                        `<span class="${cls}">${range.toString()}</span>`,
                    );
                }
            }

            function stripSz() {
                const ed = document.getElementById("rte");
                if (!ed) return;
                ed.focus();
                const sel = window.getSelection();
                if (!sel.rangeCount) return;
                ed.querySelectorAll(".sz-sm,.sz-lg,.sz-xl").forEach((s) => {
                    if (sel.containsNode(s, true)) {
                        const p = s.parentNode;
                        while (s.firstChild) p.insertBefore(s.firstChild, s);
                        p.removeChild(s);
                    }
                });
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  MODALS  ★
   ═══════════════════════════════════════════════════════════════════ */
            function openModal(id) {
                const el = document.getElementById(id);
                if (el) el.classList.add("open");
            }

            function closeModal(id) {
                const el = document.getElementById(id);
                if (el) el.classList.remove("open");
            }

            document.querySelectorAll(".overlay").forEach((o) => {
                o.addEventListener("click", (ev) => {
                    if (ev.target === o) o.classList.remove("open");
                });
            });

            document.addEventListener("keydown", (ev) => {
                if (ev.key === "Escape") {
                    document
                        .querySelectorAll(".overlay.open")
                        .forEach((m) => m.classList.remove("open"));
                }
            });

            /* ═══════════════════════════════════════════════════════════════════
   ★  CUSTOMIZATION  ★
   ═══════════════════════════════════════════════════════════════════ */
            function toggleCustomize() {
                const el = document.getElementById("customize-panel");
                if (el) el.classList.toggle("open");
            }

            // FIX: save style to localStorage so it persists across sessions
            function setVar(n, v) {
                document.documentElement.style.setProperty(n, v);
                const styles = getSavedStyles();
                styles[n] = v;
                localStorage.setItem("siteStyles", JSON.stringify(styles));
            }

            function getSavedStyles() {
                try {
                    return JSON.parse(
                        localStorage.getItem("siteStyles") || "{}",
                    );
                } catch {
                    return {};
                }
            }

            function loadSavedStyles() {
                const styles = getSavedStyles();
                Object.entries(styles).forEach(([n, v]) => {
                    document.documentElement.style.setProperty(n, v);
                    // Sync color inputs in the panel
                    const inputs = document.querySelectorAll(
                        `.customize-panel input[type=color], .customize-panel select`,
                    );
                    inputs.forEach((inp) => {
                        const onchange = inp.getAttribute("onchange") || "";
                        if (onchange.includes(n)) inp.value = v;
                    });
                });
            }

            /* ═══════════════════════════════════════════════════════════════════
   ★  UTILITY  ★
   ═══════════════════════════════════════════════════════════════════ */
            function sx(s) {
                return String(s)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;");
            }
        