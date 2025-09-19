// AI Research Agent - Main JavaScript File

class AIResearchAgent {
    constructor() {
        this.currentResearch = null;
        this.researchHistory = this.loadHistory();
        this.mockAPIs = new MockAPIService();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderHistory();
        this.setupProgressTracking();
    }

    bindEvents() {
        const form = document.getElementById('researchForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Load research from history
        document.addEventListener('click', (e) => {
            if (e.target.closest('.history-item')) {
                const researchId = e.target.closest('.history-item').dataset.researchId;
                this.loadResearchFromHistory(researchId);
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const topic = document.getElementById('researchTopic').value.trim();
        const depth = document.getElementById('researchDepth').value;
        
        if (!topic) {
            this.showError('Please enter a research topic');
            return;
        }

        await this.startResearch(topic, depth);
    }

    async startResearch(topic, depth) {
        // Create research object
        this.currentResearch = {
            id: this.generateId(),
            topic: topic,
            depth: depth,
            status: 'running',
            startTime: new Date(),
            progress: 0,
            currentStep: 1,
            logs: [],
            results: null
        };

        // Show progress section
        this.showProgressSection();
        this.disableForm();
        
        // Start the research workflow
        await this.runResearchWorkflow();
    }

    async runResearchWorkflow() {
        const steps = [
            { name: 'Input Parsing', duration: 1000 },
            { name: 'Data Gathering', duration: 3000 },
            { name: 'Processing', duration: 4000 },
            { name: 'Result Persistence', duration: 1500 },
            { name: 'Return Results', duration: 1000 }
        ];

        for (let i = 0; i < steps.length; i++) {
            await this.executeStep(i + 1, steps[i]);
        }

        // Complete the research
        await this.completeResearch();
    }

    async executeStep(stepNumber, step) {
        // Update current step
        this.currentResearch.currentStep = stepNumber;
        this.updateProgressUI(stepNumber, step.name);
        
        // Log step start
        this.addLog(`Starting ${step.name}...`);
        
        // Simulate step execution
        await this.delay(step.duration);
        
        // Execute step-specific logic
        switch (stepNumber) {
            case 1:
                await this.parseInput();
                break;
            case 2:
                await this.gatherData();
                break;
            case 3:
                await this.processData();
                break;
            case 4:
                await this.persistResults();
                break;
            case 5:
                await this.returnResults();
                break;
        }
        
        // Mark step as completed
        this.markStepCompleted(stepNumber);
        this.addLog(`${step.name} completed successfully`);
        
        // Update progress
        this.currentResearch.progress = (stepNumber / 5) * 100;
        this.updateProgressBar();
    }

    async parseInput() {
        this.addLog(`Validating research topic: "${this.currentResearch.topic}"`);
        this.addLog(`Research depth set to: ${this.currentResearch.depth}`);
        this.addLog('Input validation completed');
    }

    async gatherData() {
        this.addLog('Fetching data from external APIs...');
        
        // Simulate API calls
        const sources = await this.mockAPIs.fetchWikipediaArticles(this.currentResearch.topic);
        const news = await this.mockAPIs.fetchHackerNewsArticles(this.currentResearch.topic);
        
        this.currentResearch.rawData = {
            wikipedia: sources,
            hackernews: news
        };
        
        this.addLog(`Found ${sources.length} Wikipedia articles`);
        this.addLog(`Found ${news.length} HackerNews articles`);
        this.addLog('Data gathering completed');
    }

    async processData() {
        this.addLog('Processing and analyzing collected data...');
        
        // Extract top articles based on depth
        const depthMap = { basic: 5, detailed: 10, comprehensive: 15 };
        const maxArticles = depthMap[this.currentResearch.depth];
        
        const allSources = [
            ...this.currentResearch.rawData.wikipedia,
            ...this.currentResearch.rawData.hackernews
        ];
        
        // Sort by relevance score and take top articles
        const topSources = allSources
            .sort((a, b) => b.relevance - a.relevance)
            .slice(0, maxArticles);
        
        // Generate summary
        const summary = this.generateSummary(topSources);
        
        // Extract keywords
        const keywords = this.extractKeywords(this.currentResearch.topic, topSources);
        
        this.currentResearch.processedData = {
            sources: topSources,
            summary: summary,
            keywords: keywords
        };
        
        this.addLog(`Processed ${topSources.length} top articles`);
        this.addLog(`Generated summary (${summary.length} characters)`);
        this.addLog(`Extracted ${keywords.length} keywords`);
        this.addLog('Data processing completed');
    }

    async persistResults() {
        this.addLog('Saving results to local storage...');
        
        this.currentResearch.results = {
            summary: this.currentResearch.processedData.summary,
            sources: this.currentResearch.processedData.sources,
            keywords: this.currentResearch.processedData.keywords,
            metadata: {
                totalSources: this.currentResearch.processedData.sources.length,
                researchDepth: this.currentResearch.depth,
                processingTime: Date.now() - this.currentResearch.startTime.getTime()
            }
        };
        
        // Save to history
        this.researchHistory.unshift(this.currentResearch);
        this.saveHistory();
        
        this.addLog('Results saved successfully');
        this.addLog('Research added to history');
    }

    async returnResults() {
        this.addLog('Preparing results for display...');
        this.currentResearch.status = 'completed';
        this.currentResearch.endTime = new Date();
        
        this.addLog('Research workflow completed successfully');
        
        // Show results
        this.showResults();
    }

    showResults() {
        // Hide progress section
        document.getElementById('progressSection').style.display = 'none';
        
        // Show results section
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        // Populate results
        this.populateResults();
        
        // Re-enable form
        this.enableForm();
        
        // Update history display
        this.renderHistory();
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    populateResults() {
        const results = this.currentResearch.results;
        
        // Set topic and timestamp
        document.getElementById('resultTopic').textContent = this.currentResearch.topic;
        document.getElementById('resultTimestamp').textContent = 
            `Completed on ${this.currentResearch.endTime.toLocaleString()}`;
        
        // Populate summary
        document.getElementById('summaryContent').innerHTML = `
            <p>${results.summary}</p>
            <div class="metadata" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
                <small class="text-info">
                    <strong>Research Metadata:</strong><br>
                    Sources analyzed: ${results.metadata.totalSources} | 
                    Research depth: ${results.metadata.researchDepth} | 
                    Processing time: ${(results.metadata.processingTime / 1000).toFixed(1)}s
                </small>
            </div>
        `;
        
        // Populate sources
        const sourcesList = document.getElementById('sourcesList');
        sourcesList.innerHTML = results.sources.map(source => `
            <div class="source-item">
                <h5>${source.title}</h5>
                <p>${source.summary}</p>
                <a href="${source.url}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Read more
                </a>
                <div style="margin-top: 10px;">
                    <small class="text-info">
                        Source: ${source.source} | Relevance: ${(source.relevance * 100).toFixed(0)}%
                    </small>
                </div>
            </div>
        `).join('');
        
        // Populate keywords
        const keywordsContainer = document.getElementById('keywordsContainer');
        keywordsContainer.innerHTML = results.keywords.map(keyword => 
            `<span class="keyword-tag">${keyword}</span>`
        ).join('');
        
        // Populate logs
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = this.currentResearch.logs.map(log => `
            <div class="log-entry">
                <div class="log-timestamp">${log.timestamp}</div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
    }

    generateSummary(sources) {
        const topic = this.currentResearch.topic;
        const sourceCount = sources.length;
        
        return `Based on comprehensive analysis of ${sourceCount} high-quality sources, here's what we found about "${topic}":

The research reveals several key insights and trends in this field. Our analysis indicates significant developments and ongoing discussions around this topic. The sources provide diverse perspectives from academic research, industry reports, and expert opinions.

Key findings include emerging patterns, technological advancements, and practical applications that are shaping the current landscape. The research shows both opportunities and challenges that stakeholders should consider.

This summary synthesizes information from Wikipedia articles, HackerNews discussions, and other authoritative sources to provide a comprehensive overview of the current state and future directions in this area.

The analysis suggests continued growth and evolution in this field, with several factors driving innovation and adoption. Further research and monitoring of developments would be beneficial for staying current with rapid changes.`;
    }

    extractKeywords(topic, sources) {
        // Generate relevant keywords based on topic and sources
        const baseKeywords = topic.toLowerCase().split(' ');
        const additionalKeywords = [
            'artificial intelligence', 'machine learning', 'technology', 'innovation',
            'research', 'development', 'analysis', 'trends', 'future', 'applications',
            'industry', 'market', 'growth', 'challenges', 'opportunities', 'solutions'
        ];
        
        // Combine and filter keywords
        const allKeywords = [...baseKeywords, ...additionalKeywords];
        const uniqueKeywords = [...new Set(allKeywords)];
        
        // Return a subset of relevant keywords
        return uniqueKeywords.slice(0, 12);
    }

    updateProgressUI(stepNumber, stepName) {
        // Update current status
        document.getElementById('currentStatus').textContent = `Step ${stepNumber}/5: ${stepName}`;
        
        // Update step indicators
        for (let i = 1; i <= 5; i++) {
            const stepElement = document.getElementById(`step${i}`);
            const icon = stepElement.querySelector('i');
            
            if (i < stepNumber) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
                icon.className = 'fas fa-check-circle';
            } else if (i === stepNumber) {
                stepElement.classList.add('active');
                stepElement.classList.remove('completed');
                icon.className = 'fas fa-cog fa-spin';
            } else {
                stepElement.classList.remove('active', 'completed');
                icon.className = 'fas fa-clock';
            }
        }
    }

    markStepCompleted(stepNumber) {
        const stepElement = document.getElementById(`step${stepNumber}`);
        const icon = stepElement.querySelector('i');
        
        stepElement.classList.add('completed');
        stepElement.classList.remove('active');
        icon.className = 'fas fa-check-circle';
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = `${this.currentResearch.progress}%`;
    }

    showProgressSection() {
        // Hide form and show progress
        document.querySelector('.research-form-section').style.display = 'none';
        
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = 'block';
        progressSection.classList.add('slide-up');
        
        // Reset progress
        this.updateProgressBar();
        
        // Scroll to progress section
        progressSection.scrollIntoView({ behavior: 'smooth' });
    }

    disableForm() {
        document.getElementById('submitBtn').disabled = true;
        document.getElementById('researchTopic').disabled = true;
        document.getElementById('researchDepth').disabled = true;
    }

    enableForm() {
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('researchTopic').disabled = false;
        document.getElementById('researchDepth').disabled = false;
    }

    addLog(message) {
        const log = {
            timestamp: new Date().toLocaleTimeString(),
            message: message
        };
        this.currentResearch.logs.push(log);
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.researchHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">No previous research found. Start your first research above!</p>';
            return;
        }
        
        historyList.innerHTML = this.researchHistory.map(research => `
            <div class="history-item" data-research-id="${research.id}">
                <h5>${research.topic}</h5>
                <p>
                    ${research.status === 'completed' ? 'Completed' : 'In Progress'} • 
                    ${research.depth} depth • 
                    ${research.endTime ? research.endTime.toLocaleDateString() : 'Running...'}
                </p>
            </div>
        `).join('');
    }

    loadResearchFromHistory(researchId) {
        const research = this.researchHistory.find(r => r.id === researchId);
        if (!research || research.status !== 'completed') return;
        
        this.currentResearch = research;
        this.showResults();
    }

    setupProgressTracking() {
        // Initialize progress tracking elements
        this.updateProgressBar();
    }

    generateId() {
        return 'research_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    saveHistory() {
        try {
            localStorage.setItem('aiResearchHistory', JSON.stringify(this.researchHistory));
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('aiResearchHistory');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Convert date strings back to Date objects
                return parsed.map(research => ({
                    ...research,
                    startTime: new Date(research.startTime),
                    endTime: research.endTime ? new Date(research.endTime) : null
                }));
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
        return [];
    }

    showError(message) {
        alert(message); // Simple error handling - could be enhanced with custom modals
    }
}

// Mock API Service for simulating external data sources
class MockAPIService {
    constructor() {
        this.wikipediaData = this.generateWikipediaData();
        this.hackerNewsData = this.generateHackerNewsData();
    }

    async fetchWikipediaArticles(topic) {
        // Simulate API delay
        await this.delay(1000);
        
        // Filter articles based on topic relevance
        const relevantArticles = this.wikipediaData.filter(article => 
            article.title.toLowerCase().includes(topic.toLowerCase()) ||
            article.summary.toLowerCase().includes(topic.toLowerCase()) ||
            this.calculateRelevance(topic, article.title + ' ' + article.summary) > 0.3
        );
        
        return relevantArticles.slice(0, 8); // Return top 8 articles
    }

    async fetchHackerNewsArticles(topic) {
        // Simulate API delay
        await this.delay(1200);
        
        // Filter articles based on topic relevance
        const relevantArticles = this.hackerNewsData.filter(article => 
            article.title.toLowerCase().includes(topic.toLowerCase()) ||
            article.summary.toLowerCase().includes(topic.toLowerCase()) ||
            this.calculateRelevance(topic, article.title + ' ' + article.summary) > 0.3
        );
        
        return relevantArticles.slice(0, 7); // Return top 7 articles
    }

    calculateRelevance(topic, content) {
        const topicWords = topic.toLowerCase().split(' ');
        const contentWords = content.toLowerCase().split(' ');
        
        let matches = 0;
        topicWords.forEach(word => {
            if (contentWords.some(cWord => cWord.includes(word) || word.includes(cWord))) {
                matches++;
            }
        });
        
        return Math.min(matches / topicWords.length + Math.random() * 0.3, 1);
    }

    generateWikipediaData() {
        return [
            {
                title: "Artificial Intelligence",
                summary: "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals.",
                url: "https://en.wikipedia.org/wiki/Artificial_intelligence",
                source: "Wikipedia",
                relevance: 0.95
            },
            {
                title: "Machine Learning",
                summary: "Machine learning (ML) is a type of artificial intelligence that allows software applications to become more accurate at predicting outcomes.",
                url: "https://en.wikipedia.org/wiki/Machine_learning",
                source: "Wikipedia",
                relevance: 0.92
            },
            {
                title: "Deep Learning",
                summary: "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
                url: "https://en.wikipedia.org/wiki/Deep_learning",
                source: "Wikipedia",
                relevance: 0.88
            },
            {
                title: "Natural Language Processing",
                summary: "Natural language processing (NLP) is a subfield of linguistics, computer science, and artificial intelligence concerned with interactions between computers and human language.",
                url: "https://en.wikipedia.org/wiki/Natural_language_processing",
                source: "Wikipedia",
                relevance: 0.85
            },
            {
                title: "Computer Vision",
                summary: "Computer vision is an interdisciplinary scientific field that deals with how computers can gain high-level understanding from digital images or videos.",
                url: "https://en.wikipedia.org/wiki/Computer_vision",
                source: "Wikipedia",
                relevance: 0.82
            },
            {
                title: "Neural Network",
                summary: "A neural network is a network or circuit of neurons, or in a modern sense, an artificial neural network, composed of artificial neurons or nodes.",
                url: "https://en.wikipedia.org/wiki/Neural_network",
                source: "Wikipedia",
                relevance: 0.80
            },
            {
                title: "Data Science",
                summary: "Data science is an inter-disciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from data.",
                url: "https://en.wikipedia.org/wiki/Data_science",
                source: "Wikipedia",
                relevance: 0.78
            },
            {
                title: "Robotics",
                summary: "Robotics is an interdisciplinary research area at the interface of computer science and engineering that deals with the design, construction, operation, and use of robots.",
                url: "https://en.wikipedia.org/wiki/Robotics",
                source: "Wikipedia",
                relevance: 0.75
            },
            {
                title: "Blockchain Technology",
                summary: "A blockchain is a growing list of records, called blocks, that are linked and secured using cryptography for secure and transparent transactions.",
                url: "https://en.wikipedia.org/wiki/Blockchain",
                source: "Wikipedia",
                relevance: 0.70
            },
            {
                title: "Internet of Things",
                summary: "The Internet of things (IoT) describes the network of physical objects that are embedded with sensors, software, and other technologies for connecting and exchanging data.",
                url: "https://en.wikipedia.org/wiki/Internet_of_things",
                source: "Wikipedia",
                relevance: 0.68
            }
        ];
    }

    generateHackerNewsData() {
        return [
            {
                title: "The Future of AI in Healthcare",
                summary: "Discussion about how artificial intelligence is revolutionizing medical diagnosis, treatment planning, and patient care across various healthcare sectors.",
                url: "https://news.ycombinator.com/item?id=12345",
                source: "HackerNews",
                relevance: 0.90
            },
            {
                title: "Building Scalable Machine Learning Systems",
                summary: "Technical discussion on architecture patterns, infrastructure choices, and best practices for deploying ML models at scale in production environments.",
                url: "https://news.ycombinator.com/item?id=12346",
                source: "HackerNews",
                relevance: 0.87
            },
            {
                title: "Open Source AI Tools and Frameworks",
                summary: "Community discussion about the latest open-source tools, libraries, and frameworks that are driving innovation in artificial intelligence development.",
                url: "https://news.ycombinator.com/item?id=12347",
                source: "HackerNews",
                relevance: 0.84
            },
            {
                title: "Ethics in AI Development",
                summary: "Important conversation about responsible AI development, bias mitigation, privacy concerns, and the societal impact of artificial intelligence systems.",
                url: "https://news.ycombinator.com/item?id=12348",
                source: "HackerNews",
                relevance: 0.81
            },
            {
                title: "Startup Success with AI Integration",
                summary: "Real-world case studies and experiences from startups that have successfully integrated AI technologies into their products and business models.",
                url: "https://news.ycombinator.com/item?id=12349",
                source: "HackerNews",
                relevance: 0.78
            },
            {
                title: "Latest Breakthroughs in Research",
                summary: "Discussion of recent academic papers, research findings, and technological breakthroughs that are pushing the boundaries of what's possible.",
                url: "https://news.ycombinator.com/item?id=12350",
                source: "HackerNews",
                relevance: 0.75
            },
            {
                title: "AI in Software Development",
                summary: "How artificial intelligence is changing the way we write, test, and maintain code, including AI-powered development tools and automation.",
                url: "https://news.ycombinator.com/item?id=12351",
                source: "HackerNews",
                relevance: 0.72
            },
            {
                title: "Data Privacy and Security",
                summary: "Technical discussion about protecting user data, implementing privacy-preserving technologies, and maintaining security in data-driven applications.",
                url: "https://news.ycombinator.com/item?id=12352",
                source: "HackerNews",
                relevance: 0.69
            },
            {
                title: "Cloud Computing Innovations",
                summary: "Latest developments in cloud infrastructure, serverless computing, and distributed systems that enable modern application development.",
                url: "https://news.ycombinator.com/item?id=12353",
                source: "HackerNews",
                relevance: 0.66
            },
            {
                title: "Mobile Technology Trends",
                summary: "Discussion about emerging mobile technologies, development frameworks, and user experience innovations in mobile application development.",
                url: "https://news.ycombinator.com/item?id=12354",
                source: "HackerNews",
                relevance: 0.63
            }
        ];
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Tab Management Functions
function showTab(tabName) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab pane
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Reset Form Function
function resetForm() {
    // Hide results section
    document.getElementById('resultsSection').style.display = 'none';
    
    // Show form section
    document.querySelector('.research-form-section').style.display = 'block';
    
    // Clear form
    document.getElementById('researchForm').reset();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiResearchAgent = new AIResearchAgent();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIResearchAgent, MockAPIService };
}