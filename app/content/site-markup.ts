export const mastheadMarkup = `<!-- MASTHEAD -->
        <header class="masthead">
            <div class="masthead-date" id="live-date"></div>
            <h1 class="masthead-title">
                <span
                    class="r"
                    style="--rot: -1.5deg; --bg: #1a1008; --col: #f2ead8"
                    >I</span
                ><span class="r" style="--rot: 0.5deg">n</span>&nbsp;<span
                    class="r"
                    style="--rot: -1deg"
                    >C</span
                ><span class="r" style="--rot: 1.5deg">a</span
                ><span class="r" style="--rot: -0.5deg">s</span
                ><span class="r" style="--rot: 1deg">e</span>&nbsp;<span
                    class="r"
                    style="--rot: -0.5deg; --col: #8b1a1a"
                    >N</span
                ><span class="r" style="--rot: 1deg">o</span>&nbsp;<span
                    class="r"
                    style="--rot: -1.5deg; --bg: #8b1a1a; --col: #f2ead8"
                    >O</span
                ><span class="r" style="--rot: 0.5deg">n</span
                ><span class="r" style="--rot: -1deg">e</span>&nbsp;<span
                    class="r"
                    style="--rot: 1.5deg"
                    >A</span
                ><span
                    class="r"
                    style="--rot: -1deg; --bg: #1a1008; --col: #f2ead8"
                    >s</span
                ><span class="r" style="--rot: 0.5deg">k</span
                ><span class="r" style="--rot: -1.5deg">e</span
                ><span class="r" style="--rot: 1deg">d</span>
            </h1>
            <p class="masthead-tagline">
                Never meant to be neat &nbsp;·&nbsp; Just meant to be written
            </p>
        </header>`;

export const topBarMarkup = `<!-- TOP BAR -->
        <div class="top-bar" id="top-bar">
            <span class="admin-badge" id="admin-badge" style="display: none"
                >✦ <span class="badge-text">Admin</span></span
            >
            <button
                class="btn btn-solid"
                id="btn-new-post"
                style="display: none"
                onclick="openNewPost()"
            >
                + New Post
            </button>
            <button
                class="btn btn-ghost"
                id="btn-style"
                style="display: none"
                onclick="toggleCustomize()"
            >
                ⚙ Style
            </button>
            <button
                class="btn btn-ghost btn-sm"
                id="btn-logout"
                style="display: none"
                onclick="doLogout()"
            >
                Logout
            </button>
            <button
                class="btn btn-ghost btn-sm ml-auto"
                id="btn-login"
                onclick="openModal('login-modal')"
            >
                Admin Login
            </button>
        </div>`;

export const customizePanelMarkup = `<!-- CUSTOMIZE PANEL -->
        <div class="customize-panel" id="customize-panel">
            <div class="cg">
                <label>Paper</label
                ><input
                    type="color"
                    value="#f2ead8"
                    onchange="setVar('--paper', this.value)"
                />
            </div>
            <div class="cg">
                <label>Ink</label
                ><input
                    type="color"
                    value="#1a1008"
                    onchange="setVar('--ink', this.value)"
                />
            </div>
            <div class="cg">
                <label>Accent</label
                ><input
                    type="color"
                    value="#8b1a1a"
                    onchange="setVar('--red', this.value)"
                />
            </div>
            <div class="cg">
                <label>Rules</label
                ><input
                    type="color"
                    value="#8b7355"
                    onchange="setVar('--rule', this.value)"
                />
            </div>
            <div class="cg">
                <label>Heading Font</label>
                <select onchange="setVar('--fh', this.value)">
                    <option value="'Special Elite',cursive">
                        Special Elite (typewriter)
                    </option>
                    <option value="'UnifrakturMaguntia',cursive">
                        UnifrakturMaguntia (gothic)
                    </option>
                    <option value="'Libre Baskerville',serif">
                        Libre Baskerville (classic)
                    </option>
                </select>
            </div>
        </div>`;

export const mainMarkup = `<!-- MAIN -->
        <main>
            <div class="main-wrap">
                <!-- POSTS -->
                <div class="posts-col" id="posts-col">
                    <!-- ════════════════════════════════════════════
           POST 1 — PINNED / ORIGIN STORY (always open)
           ════════════════════════════════════════════ -->
                    <article class="post" id="post-1">
                        <div class="stamp" style="--rot: 6deg">PINNED</div>
                        <div class="post-cat">✦ Origin Story ✦</div>
                        <h2
                            class="post-headline"
                            style="font-size: clamp(20px, 4.5vw, 34px)"
                        >
                            <span
                                class="r"
                                style="
                                    --rot: -1.5deg;
                                    --bg: #1a1008;
                                    --col: #f2ead8;
                                "
                                >N</span
                            ><span class="r" style="--rot: 0.5deg">o</span
                            ><span class="r" style="--rot: -0.5deg">b</span
                            ><span class="r" style="--rot: 1deg">o</span
                            ><span class="r" style="--rot: -1.5deg">d</span
                            ><span class="r" style="--rot: 0.5deg">y</span
                            >&nbsp;<span class="r" style="--rot: -1deg">A</span
                            ><span class="r" style="--rot: 1.5deg">s</span
                            ><span class="r" style="--rot: -0.5deg">k</span
                            ><span class="r" style="--rot: 1deg">e</span
                            ><span class="r" style="--rot: -1.5deg">d</span
                            >,&nbsp;<span
                                class="r"
                                style="
                                    --rot: 0.5deg;
                                    --bg: #8b1a1a;
                                    --col: #f2ead8;
                                "
                                >W</span
                            ><span class="r" style="--rot: -1deg">e</span
                            >&nbsp;<span class="r" style="--rot: 1.5deg">T</span
                            ><span class="r" style="--rot: -0.5deg">o</span
                            ><span class="r" style="--rot: 1deg">l</span
                            ><span class="r" style="--rot: -1.5deg">d</span
                            >&nbsp;<span
                                class="r"
                                style="
                                    --rot: 0.5deg;
                                    --bg: #1a1008;
                                    --col: #f2ead8;
                                "
                                >Y</span
                            ><span class="r" style="--rot: -1deg">o</span
                            ><span class="r" style="--rot: 1.5deg">u</span
                            >&nbsp;<span class="r" style="--rot: -0.5deg"
                                >A</span
                            ><span class="r" style="--rot: 1deg">n</span
                            ><span class="r" style="--rot: -1.5deg">y</span
                            ><span class="r" style="--rot: 0.5deg">w</span
                            ><span class="r" style="--rot: -1deg">a</span
                            ><span class="r" style="--rot: 1.5deg">y</span>
                        </h2>
                        <div class="post-byline">
                            <span
                                >By The Editors &nbsp;·&nbsp; April 30,
                                2026</span
                            >
                            <div class="post-actions" id="pa-post-1"></div>
                        </div>
                        <!-- ✏️ EDIT YOUR ORIGIN STORY BODY HERE -->
                        <div class="post-body" id="pb-post-1">
                            Two writers — armed with nothing but unsolicited
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
                            here now. Might as well read.
                        </div>
                        <div class="post-tags" style="margin-top: 10px">
                            <span class="torn-tag" style="--rot: -1.5deg"
                                >First Issue</span
                            >
                            <span
                                class="torn-tag"
                                style="--rot: 1deg; background: var(--smudge)"
                                >Manifesto</span
                            >
                        </div>
                        <div class="reactions" data-post="post-1"></div>
                    </article>

                    <!-- ════════════════════════════════════════════
           POST 2 — replace with your own story
           ════════════════════════════════════════════ -->
                    <article class="post" id="post-2">
                        <div class="post-cat">✦ Culture ✦</div>
                        <!-- ✏️ CHANGE HEADLINE -->
                        <h2 class="post-headline">
                            On the Virtues of Having a Blog Nobody Reads
                            <em>(Yet)</em>
                        </h2>
                        <div class="post-byline">
                            <!-- ✏️ CHANGE BYLINE -->
                            <span
                                >A Meditation on Obscurity &nbsp;·&nbsp; Apr 30,
                                2026</span
                            >
                            <div class="post-actions" id="pa-post-2">
                                <button
                                    class="read-more-btn"
                                    onclick="toggleBody('pb-post-2', this)"
                                >
                                    Read more ▾
                                </button>
                            </div>
                        </div>
                        <!-- ✏️ CHANGE BODY — supports <strong>, <em>, <u>, <blockquote> -->
                        <div
                            class="post-body"
                            id="pb-post-2"
                            style="display: none"
                        >
                            There is a quiet dignity in shouting into the void.
                            The void, after all, never talks back. Your hit
                            counter reads "3" and two of those were you,
                            refreshing in incognito mode to check if the font
                            loaded. The third was a web crawler from a country
                            that doesn't exist anymore. And yet — you wrote. You
                            published. You told the algorithm:
                            <strong>I AM HERE.</strong> The algorithm did not
                            respond. You published again anyway. That is the
                            spirit of <em>In Case No One Asked.</em>
                        </div>
                        <div class="reactions" data-post="post-2"></div>
                    </article>

                    <!-- ════════════════════════════════════════════
           POST 3 — replace with your own story
           ════════════════════════════════════════════ -->
                    <article class="post" id="post-3">
                        <div class="stamp" style="--rot: -5deg">HOT TAKE</div>
                        <div class="post-cat">✦ Opinion ✦</div>
                        <h2 class="post-headline">
                            Fonts Are a Personality: A Defense of Too Many
                            Typefaces
                        </h2>
                        <div class="post-byline">
                            <span>Editorial &nbsp;·&nbsp; Apr 30, 2026</span>
                            <div class="post-actions" id="pa-post-3">
                                <button
                                    class="read-more-btn"
                                    onclick="toggleBody('pb-post-3', this)"
                                >
                                    Read more ▾
                                </button>
                            </div>
                        </div>
                        <div
                            class="post-body"
                            id="pb-post-3"
                            style="display: none"
                        >
                            Some designers say consistency is key. Those people
                            have never felt the primal joy of mixing a serif, a
                            monospace, and a novelty display font in a single
                            headline — and <em>feeling</em>, truly feeling, that
                            it works.
                            <strong
                                >This is not chaos. This is character.</strong
                            >
                            You didn't ask for this opinion. You have it now.
                        </div>
                        <div class="reactions" data-post="post-3"></div>
                    </article>

                    <!-- new posts land here -->
                    <div id="dynamic-posts"></div>
                </div>
                <!-- /posts-col -->

                <!-- SIDEBAR — comments only -->
                <div class="sidebar-col">
                    <div class="sidebar-sec">
                        <div class="sb-head">
                            <span>✉ Reader Mail</span>
                            <span class="ccount-badge" id="ccount">0</span>
                        </div>

                        <!-- Comments load here from Sanity CMS -->
                        <div id="comments-container">
                            <p
                                style="
                                    font-family: var(--fh);
                                    font-size: 11px;
                                    color: var(--rule);
                                    letter-spacing: 1px;
                                    text-align: center;
                                    padding: 10px 0;
                                "
                            >
                                — Be the first to leave a note —
                            </p>
                        </div>

                        <div
                            style="
                                font-family: var(--fh);
                                font-size: 11px;
                                letter-spacing: 3px;
                                text-transform: uppercase;
                                border-bottom: 1px dashed var(--rule);
                                padding-bottom: 4px;
                                margin: 14px 0 10px;
                            "
                        >
                            ✦ Leave a Note
                        </div>
                        <div class="form-field">
                            <label>Your name (or alias)</label>
                            <input
                                type="text"
                                id="cname"
                                placeholder="e.g. Mysterious Stranger"
                                autocomplete="off"
                            />
                        </div>
                        <div class="form-field">
                            <label>Your message</label>
                            <textarea
                                id="cmsg"
                                placeholder="Thoughts, confessions, complaints..."
                            ></textarea>
                        </div>
                        <button class="submit-btn" onclick="addComment()">
                            — Submit Dispatch —
                        </button>
                    </div>
                </div>
            </div>
        </main>`;

export const footerMarkup = `<!-- FOOTER -->
        <footer>
            <div class="footer-inner">
                <div class="footer-copy">
                    ✦ &nbsp; In Case No One Asked &nbsp; ✦
                    <br />Printed on recycled audacity <br />All opinions are
                    final
                </div>

                <div class="footer-links">
                    <div class="footer-links-title">✦ Find Us</div>

                    <!-- ✏️ REPLACE with your real emails / links -->
                    <a class="footer-link" href="mailto:yourname@email.com">
                        <span>✉</span>
                        <span>
                            <span class="link-label">Writer One &nbsp;—</span>
                            yourname@email.com
                        </span>
                    </a>
                    <a class="footer-link" href="mailto:friendname@email.com">
                        <span>✉</span>
                        <span>
                            <span class="link-label">Writer Two &nbsp;—</span>
                            friendname@email.com
                        </span>
                    </a>

                    <!-- Optional: add social links below the same way -->
                    <!-- <a class="footer-link" href="https://instagram.com/yourhandle" target="_blank">
        <span>◈</span>
        <span><span class="link-label">Instagram &nbsp;—</span> @yourhandle</span>
      </a> -->
                </div>
            </div>
            <hr class="footer-divider" />
            <div
                style="
                    font-size: 9px;
                    opacity: 0.5;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-top: 12px;
                    text-align: center;
                "
            >
                Built with scissors, glue &amp; HTML
            </div>
        </footer>`;

export const loginModalMarkup = `<!-- ADMIN LOGIN MODAL -->
        <div class="overlay" id="login-modal">
            <div class="modal login-modal">
                <button class="modal-close" onclick="closeModal('login-modal')">
                    ✕
                </button>
                <span class="lock-icon">🔐</span>
                <div class="modal-title">Admin Access</div>
                <div class="form-field">
                    <label>Password</label>
                    <input
                        type="password"
                        id="login-pw"
                        placeholder="Enter admin password"
                        onkeydown="if (event.key === 'Enter') doLogin();"
                        autocomplete="current-password"
                    />
                </div>
                <div class="login-error" id="login-error">
                    ✕ Wrong password. Try again.
                </div>
                <button
                    class="submit-btn"
                    onclick="doLogin()"
                    style="margin-top: 8px"
                >
                    — Enter —
                </button>
                <p class="login-hint">
                    Set <code>SANITY_ADMIN_PASSWORD</code> for production.
                </p>
            </div>
        </div>`;

export const postModalMarkup = `<!-- WRITE / EDIT POST MODAL -->
        <div class="overlay" id="post-modal">
            <div class="modal">
                <button class="modal-close" onclick="closeModal('post-modal')">
                    ✕
                </button>
                <div class="modal-title" id="pm-title">
                    ✦ Write a New Story ✦
                </div>

                <div class="form-field">
                    <label>Category</label>
                    <input
                        type="text"
                        id="p-cat"
                        placeholder="Opinion, Culture, Travel…"
                    />
                </div>
                <div class="form-field">
                    <label>Headline</label>
                    <input
                        type="text"
                        id="p-title"
                        placeholder="Something nobody asked for but needs to hear…"
                    />
                </div>
                <div class="form-field">
                    <label>Byline</label>
                    <input
                        type="text"
                        id="p-byline"
                        placeholder="By Your Name · Date"
                    />
                </div>

                <div class="form-field">
                    <label>Story Body</label>
                    <div class="rte-wrap">
                        <div class="rte-toolbar">
                            <button
                                type="button"
                                class="tb"
                                title="Bold"
                                onmousedown="ev(event)"
                                onclick="cmd('bold')"
                            >
                                <b>B</b>
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="Italic"
                                onmousedown="ev(event)"
                                onclick="cmd('italic')"
                            >
                                <i>I</i>
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="Underline"
                                onmousedown="ev(event)"
                                onclick="cmd('underline')"
                            >
                                <u>U</u>
                            </button>
                            <div class="tb-sep"></div>
                            <button
                                type="button"
                                class="tb"
                                title="Small text"
                                onmousedown="ev(event)"
                                onclick="wrapSz('sz-sm')"
                            >
                                S
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="Normal text"
                                onmousedown="ev(event)"
                                onclick="stripSz()"
                            >
                                N
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="Large text"
                                onmousedown="ev(event)"
                                onclick="wrapSz('sz-lg')"
                            >
                                L
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="X-Large"
                                onmousedown="ev(event)"
                                onclick="wrapSz('sz-xl')"
                            >
                                XL
                            </button>
                            <div class="tb-sep"></div>
                            <button
                                type="button"
                                class="tb"
                                title="Blockquote"
                                onmousedown="ev(event)"
                                onclick="cmd('formatBlock', 'blockquote')"
                            >
                                ❝
                            </button>
                            <button
                                type="button"
                                class="tb"
                                title="Clear format"
                                onmousedown="ev(event)"
                                onclick="cmd('removeFormat')"
                            >
                                ✕ Clear
                            </button>
                        </div>
                        <div
                            class="rte-body"
                            id="rte"
                            contenteditable="true"
                            data-ph="Write your story here. First letter becomes a drop cap automatically…"
                        ></div>
                    </div>
                </div>

                <div class="form-field">
                    <label>Tag (optional)</label>
                    <input type="text" id="p-tag" placeholder="e.g. Hot Take" />
                </div>
                <div class="form-field">
                    <label>Image (optional)</label>
                    <div
                        style="
                            display: flex;
                            gap: 8px;
                            align-items: center;
                            flex-wrap: wrap;
                        "
                    >
                        <button
                            type="button"
                            class="btn btn-ghost"
                            style="
                                transform: none;
                                font-size: 10px;
                                padding: 5px 10px;
                            "
                            onclick="
                                document.getElementById('modal-img').click()
                            "
                        >
                            📎 Choose Image
                        </button>
                        <span
                            style="
                                font-size: 10px;
                                color: var(--smudge);
                                font-family: var(--fh);
                            "
                            id="img-name"
                            >No file chosen</span
                        >
                        <input
                            type="file"
                            id="modal-img"
                            accept="image/*"
                            style="display: none"
                            onchange="prevImg(event)"
                        />
                    </div>
                    <div id="img-prev" style="margin-top: 8px"></div>
                </div>

                <input type="hidden" id="edit-id" value="" />
                <div class="modal-actions">
                    <button
                        class="submit-btn"
                        id="pm-save-btn"
                        onclick="savePost()"
                    >
                        — Publish Story —
                    </button>
                    <button
                        class="btn btn-ghost"
                        style="
                            transform: none;
                            padding: 9px 16px;
                            font-size: 10px;
                        "
                        onclick="closeModal('post-modal')"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>`;

export const deleteModalMarkup = `<!-- DELETE CONFIRM -->
        <div class="overlay" id="del-modal">
            <div class="modal modal-sm delete-modal">
                <div class="modal-title">✕ Delete Story?</div>
                <p>This cannot be undone. The words will vanish.</p>
                <div class="modal-actions">
                    <button
                        class="submit-btn"
                        style="background: var(--red); transform: none"
                        onclick="doDelete()"
                    >
                        Yes, Delete
                    </button>
                    <button
                        class="btn btn-ghost"
                        style="transform: none; flex: 1; padding: 9px"
                        onclick="closeModal('del-modal')"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>`;

export const deleteCommentModalMarkup = `<!-- DELETE COMMENT CONFIRM -->
        <div class="overlay" id="del-comment-modal">
            <div class="modal modal-sm delete-modal">
                <button
                    class="modal-close"
                    onclick="closeModal('del-comment-modal')"
                >
                    ✕
                </button>
                <div class="modal-title">✕ Delete Note?</div>
                <p>This cannot be undone. Your words will vanish.</p>
                <div class="modal-actions">
                    <button
                        class="submit-btn"
                        style="background: var(--red); transform: none"
                        onclick="doDeleteComment()"
                    >
                        Yes, Delete
                    </button>
                    <button
                        class="btn btn-ghost"
                        style="transform: none; flex: 1; padding: 9px"
                        onclick="closeModal('del-comment-modal')"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>`;
