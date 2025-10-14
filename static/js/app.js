// YouSearch Frontend JavaScript - Figma Design Implementation

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const skeletonLoading = document.getElementById('skeleton-loading');
    const errorDiv = document.getElementById('error');
    const formatRadios = document.querySelectorAll('input[name="format"]');
    const formatSelector = document.getElementById('format-selector');
    const heroContainer = document.querySelector('.hero-container');
    const featureCards = document.querySelectorAll('.feature-card');
    const featuresGrid = document.getElementById('features-grid');
    const resultsHeader = document.getElementById('results-header');
    const resultsCount = document.getElementById('results-count');
    const resultsTime = document.getElementById('results-time');
    const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
    const floatingSearch = document.getElementById('floating-search');
    const floatingSearchInput = document.getElementById('floating-search-input');
    const floatingSearchForm = document.getElementById('floating-search-form');
    const loadingQuery = document.getElementById('loading-query');

    let currentView = 'visual';

    // Handle feature card clicks
    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const text = card.querySelector('.feature-text').textContent;
            searchInput.value = text;
            searchForm.dispatchEvent(new Event('submit'));
        });
    });

    // Handle view toggle
    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            viewToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render results in new view
            if (window.lastSearchData) {
                if (currentView === 'code') {
                    displayRawOutput(JSON.stringify(window.lastSearchData, null, 2), 'JSON Response');
                } else {
                    displayWebResults(window.lastSearchData);
                }
            }
        });
    });

    // Handle floating search form
    floatingSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = floatingSearchInput.value.trim();
        if (query) {
            searchInput.value = query;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                searchForm.dispatchEvent(new Event('submit'));
            }, 300);
        }
    });

    // Handle main search form submission
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const query = searchInput.value.trim();
        if (!query) return;

        // Show format selector on first search
        if (formatSelector.classList.contains('hidden')) {
            formatSelector.classList.remove('hidden');
        }

        // Get selected format
        let format = 'web';
        formatRadios.forEach(radio => {
            if (radio.checked) {
                format = radio.value;
            }
        });

        // Hide hero content
        if (heroContainer && featuresGrid) {
            heroContainer.style.minHeight = '150px';
            featuresGrid.style.display = 'none';
        }

        // Show loading state
        loadingQuery.textContent = query;
        loadingDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '';
        errorDiv.classList.add('hidden');
        resultsHeader.classList.add('hidden');
        floatingSearch.classList.add('hidden');

        // Show skeleton after 500ms
        const skeletonTimeout = setTimeout(() => {
            loadingDiv.classList.add('hidden');
            skeletonLoading.classList.remove('hidden');
        }, 500);

        try {
            const startTime = performance.now();
            const response = await fetch(`/search?q=${encodeURIComponent(query)}&format=${format === 'llm' ? 'text' : 'json'}`);
            const endTime = performance.now();
            const searchTime = ((endTime - startTime) / 1000).toFixed(2);

            clearTimeout(skeletonTimeout);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Search failed');
            }

            // Handle different formats
            if (format === 'llm') {
                const text = await response.text();
                window.lastSearchData = { text, format: 'llm' };
                displayRawOutput(text, 'LLM-Friendly Format');
                updateResultsHeader(0, searchTime);
            } else if (format === 'json' || currentView === 'code') {
                const data = await response.json();
                window.lastSearchData = data;
                displayRawOutput(JSON.stringify(data, null, 2), 'JSON Response');
                const count = countResults(data);
                updateResultsHeader(count, searchTime);
            } else {
                const data = await response.json();
                window.lastSearchData = data;
                displayWebResults(data);
                const count = countResults(data);
                updateResultsHeader(count, searchTime);
            }

            // Update floating search
            floatingSearchInput.value = query;
            floatingSearchInput.placeholder = query;
            floatingSearch.classList.remove('hidden');

        } catch (error) {
            clearTimeout(skeletonTimeout);
            displayError(error.message);
        } finally {
            loadingDiv.classList.add('hidden');
            skeletonLoading.classList.add('hidden');
        }
    });

    function countResults(data) {
        let count = 0;
        if (data.results && data.results.results) {
            if (data.results.results.web) count += data.results.results.web.length;
            if (data.results.results.news) count += data.results.results.news.length;
        }
        return count;
    }

    function updateResultsHeader(count, time) {
        resultsCount.textContent = `Results (${count})`;
        resultsTime.textContent = `About ${count} results (${time}s)`;
        resultsHeader.classList.remove('hidden');
    }

    function displayWebResults(data) {
        resultsDiv.innerHTML = '';

        const results = data.results;

        // Display web results
        if (results.results && results.results.web && results.results.web.length > 0) {
            results.results.web.forEach(result => {
                const resultItem = createResultElement(result);
                resultsDiv.appendChild(resultItem);
            });
        }

        // Display news results
        if (results.results && results.results.news && results.results.news.length > 0) {
            results.results.news.forEach(result => {
                const resultItem = createResultElement(result);
                resultsDiv.appendChild(resultItem);
            });
        }

        if (resultsDiv.children.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No results found.</p>';
        }
    }

    function createResultElement(result) {
        const div = document.createElement('div');
        div.className = 'result-item';

        // Result header with favicon
        const header = document.createElement('div');
        header.className = 'result-header';

        const favicon = document.createElement('div');
        favicon.className = 'result-favicon';

        if (result.favicon_url) {
            const img = document.createElement('img');
            img.src = result.favicon_url;
            img.alt = '';
            img.onerror = () => {
                favicon.innerHTML = '<span style="font-size: 16px;">🔍</span>';
            };
            favicon.appendChild(img);
        } else {
            favicon.innerHTML = '<span style="font-size: 16px;">🔍</span>';
        }

        const content = document.createElement('div');
        content.className = 'result-content';

        const title = document.createElement('a');
        title.href = result.url || '#';
        title.target = '_blank';
        title.className = 'result-title';
        title.textContent = result.title || 'No title';

        const url = document.createElement('div');
        url.className = 'result-url';
        url.textContent = result.url || '';

        content.appendChild(title);
        content.appendChild(url);

        header.appendChild(favicon);
        header.appendChild(content);
        div.appendChild(header);

        // Description
        if (result.description) {
            const description = document.createElement('div');
            description.className = 'result-description';
            description.textContent = result.description;
            div.appendChild(description);
        }

        // Snippets with toggle
        if (result.snippets && result.snippets.length > 0) {
            const snippetsDiv = document.createElement('div');
            snippetsDiv.className = 'result-snippets';

            const toggle = document.createElement('button');
            toggle.className = 'snippets-toggle';
            toggle.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M19 9l-7 7-7-7"/>
                </svg>
                <span>Show context snippets</span>
            `;

            const snippetsContent = document.createElement('div');
            snippetsContent.className = 'snippets-content hidden';

            result.snippets.slice(0, 5).forEach(snippet => {
                const snippetDiv = document.createElement('div');
                snippetDiv.className = 'snippet';
                snippetDiv.textContent = snippet;
                snippetsContent.appendChild(snippetDiv);
            });

            toggle.addEventListener('click', () => {
                snippetsContent.classList.toggle('hidden');
                toggle.classList.toggle('expanded');
                const span = toggle.querySelector('span');
                span.textContent = snippetsContent.classList.contains('hidden')
                    ? 'Show context snippets'
                    : 'Hide context snippets';
            });

            snippetsDiv.appendChild(toggle);
            snippetsDiv.appendChild(snippetsContent);
            div.appendChild(snippetsDiv);
        }

        return div;
    }

    function displayRawOutput(content, title) {
        resultsDiv.innerHTML = '';

        const titleElement = document.createElement('h2');
        titleElement.className = 'section-title';
        titleElement.textContent = title;

        const pre = document.createElement('pre');
        pre.className = 'raw-output';
        pre.textContent = content;

        resultsDiv.appendChild(titleElement);
        resultsDiv.appendChild(pre);
    }

    function displayError(message) {
        errorDiv.textContent = `Error: ${message}`;
        errorDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '';
        resultsHeader.classList.add('hidden');
    }

    // Load query from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q') || urlParams.get('query');
    if (queryParam) {
        searchInput.value = queryParam;
        searchForm.dispatchEvent(new Event('submit'));
    }
});
