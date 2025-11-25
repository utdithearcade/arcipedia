# Arcipedia

### Executive Summary

**Arcipedia** is a reimagined encyclopedic platform designed to bridge the gap between traditional information retrieval and modern social media consumption habits. By leveraging the **Wikipedia (MediaWiki) API**, Arcipedia transforms static articles into a dynamic, "feed-first" experience. The application is architected as a **Client-Side Only (CSO)** solution, utilizing **Tailwind CSS** for rapid, utility-first UI development and **Vanilla JavaScript** for high-performance logic, ensuring a lightweight, serverless deployment on **GitHub Pages**.

### I. Technology Stack and Architecture

The project adheres to a "No-Build" or "Low-Build" philosophy to maintain simplicity and maximum control over the code execution.

| Component | Technology | Role & Rationale |
| :--- | :--- | :--- |
| **Structure** | **HTML5** | Semantic markup serving as the application shell. |
| **Styling** | **Tailwind CSS** | A utility-first CSS framework used to construct a bespoke, clean design system without writing custom CSS files. Enables rapid prototyping of complex layouts (grids, flex) and dark mode implementation. |
| **Logic** | **Vanilla JavaScript (ES6+)** | Handles state management, API data fetching, DOM manipulation, and URL routing. No heavy frameworks (React/Vue) ensures near-instant Time-to-Interactive (TTI). |
| **Data Layer** | **MediaWiki API** | The official public API for Wikipedia, accessed via cross-origin resource sharing (CORS) enabled requests. |
| **Hosting** | **GitHub Pages** | Static hosting environment that perfectly serves the HTML/JS assets with zero backend maintenance. |

### II. Design System & User Interface (Tailwind Implementation)

The design philosophy is "Content is King." The UI recedes to let the text and imagery take focus.

#### 1\. Visual Language

  * **Typography:** System-ui sans-serif fonts (Inter/San Francisco/Roboto) managed via Tailwind's `font-sans` utilities. High readability is prioritized with `leading-relaxed` and `tracking-wide`.
  * **Color Palette:** A monochrome base with subtle accents.
      * *Light Mode:* `bg-slate-50` backgrounds with `text-slate-900` for high contrast text.
      * *Dark Mode:* `bg-slate-900` backgrounds with `text-slate-200` text, activated via the `dark:` prefix in Tailwind.
  * **Components:**
      * *Cards:* `rounded-xl`, `shadow-sm`, `hover:shadow-md` transition effects.
      * *Buttons:* `rounded-full` (pill shape) to mimic modern mobile app interfaces.

#### 2\. Layout Strategy

  * **Mobile-First Approach:** The base classes target mobile viewports (single column). Breakpoints (`md:`, `lg:`) are used to introduce multi-column grids for desktop users, ensuring the "feed" feel persists across devices.
  * **Z-Index Management:** Extensive use of `z-index` for the search overlay and article reading modal to maintain context without page reloads.

### III. Functional Specifications & Data Logic

#### 1\. The Infinite Random Feed (Home)

  * **Concept:** A TikTok/Instagram-style vertical scroll of random knowledge.
  * **Technical Implementation:**
      * **API Endpoint:** `action=query&generator=random&grnnamespace=0&prop=pageimages|extracts`
      * **Logic:** A JavaScript function fetches 10 items at a time.
      * **Tailwind Rendering:** JavaScript dynamically constructs HTML strings using Template Literals, injecting Tailwind classes (e.g., `<div class="p-4 mb-4 bg-white rounded-lg...">`) before appending them to the DOM.
      * **Observer:** An `IntersectionObserver` detects when the user scrolls to the bottom sentinel element to trigger the next fetch automatically.

#### 2\. The Immersive Article View

  * **Concept:** A distraction-free reading mode that slides over the feed.
  * **Technical Implementation:**
      * **API Endpoint:** `action=parse&page={title}&prop=text` or `prop=extracts`.
      * **Sanitization:** A custom parser removes specific Wikipedia classes (`mw-editsection`, `infobox`, `reference`) to strip visual noise.
      * **Styling:** The content container uses Tailwind's `@tailwindcss/typography` (prose plugin) if available, or manual styling (`prose`, `prose-lg`, `dark:prose-invert`) to automatically format the raw HTML returned by the API.
      * **Navigation:** Uses `history.pushState` to update the URL to `/article/title` without reloading, allowing users to use the browser's "Back" button to return to their exact spot in the feed.

#### 3\. Live Search & Discovery

  * **Concept:** An omnipresent search bar that offers instant suggestions.
  * **Technical Implementation:**
      * **API Endpoint:** `action=opensearch` or `list=prefixsearch`.
      * **Debouncing:** A custom utility function prevents API calls until the user stops typing for 300ms.
      * **UI Feedback:** A "skeleton loader" animation (using Tailwind's `animate-pulse` and `bg-slate-200`) is displayed while data is being fetched.

#### 4\. Categorized Feeds

  * **Concept:** Filtering the random noise into specific channels (e.g., Tech, History, Art).
  * **Technical Implementation:**
      * **State Change:** Clicking a category chip updates a global `currentContext` variable.
      * **API Switch:** The feed logic switches from `generator=random` to `list=categorymembers`.
      * **Visual Cue:** The active category chip receives a distinct style (e.g., `bg-blue-600 text-white`) to indicate the current filter.

### IV. Development Roadmap

#### Phase 1: The Skeleton & Configuration

1.  Setup the project directory and `index.html`.
2.  Integrate Tailwind CSS (via CDN for development speed or CLI for production optimization).
3.  Establish the basic DOM structure: Header, Feed Container, Hidden Modal Container.

#### Phase 2: The Engine (JavaScript Core)

1.  Create `api.js`: A module dedicated to handling `fetch` requests and error handling.
2.  Create `render.js`: A module containing template functions that return HTML strings with Tailwind classes.
3.  Implement the "Random Feed" logic to successfully load and display 10 items.

#### Phase 3: The Experience (Interactivity)

1.  Implement `IntersectionObserver` for infinite scrolling.
2.  Build the Article View modal and the HTML sanitization logic.
3.  Add the Search Overlay with debounced input handling.

#### Phase 4: Polish & Deployment

1.  Implement Dark Mode toggle logic (checking `window.matchMedia`).
2.  Refine mobile responsiveness and touch targets.
3.  Deploy to GitHub Pages.

### V. Directory Structure

```text
/arcipedia
├── index.html          # Single entry point
├── js
│   ├── app.js          # Main controller
│   ├── api.js          # Wikipedia API interaction layer
│   ├── components.js   # HTML Templates with Tailwind classes
│   └── utils.js        # Debounce, sanitize, and helper functions
├── css
│   └── input.css       # Custom directives (if using Tailwind CLI)
└── assets
    └── images          # Static assets (logo, placeholders)
```

-----

