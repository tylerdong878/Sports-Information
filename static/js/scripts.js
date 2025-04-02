// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    document.getElementById('analyzeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset and show progress
        document.getElementById('analysisProgress').style.display = 'block';
        document.getElementById('results').style.display = 'none';
        document.getElementById('console').innerHTML = '';
        document.getElementById('statusMessages').innerHTML = '';
        document.getElementById('progressBar').style.width = '0%';
        
        // Update threshold badges
        const pointsThreshold = document.getElementById('pointsThreshold').value;
        const reboundsThreshold = document.getElementById('reboundsThreshold').value;
        const assistsThreshold = document.getElementById('assistsThreshold').value;
        const numGames = document.getElementById('numGames').value;
        
        document.getElementById('pointsThresholdBadge').textContent = `${pointsThreshold}+ pts`;
        document.getElementById('reboundsThresholdBadge').textContent = `${reboundsThreshold}+ reb`;
        document.getElementById('assistsThresholdBadge').textContent = `${assistsThreshold}+ ast`;
        
        // Collect form data
        const data = {
            num_games: numGames,
            points_threshold: pointsThreshold,
            rebounds_threshold: reboundsThreshold,
            assists_threshold: assistsThreshold
        };
        
        // Setup EventSource for Server-Sent Events
        const eventSource = new EventSource('/analyze?' + new URLSearchParams(data));
        
        eventSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            // Add message to console
            const consoleElement = document.getElementById('console');
            
            // Handle different message types
            if (data.type === 'progress') {
                // Update progress bar
                document.getElementById('progressBar').style.width = data.percentage.toFixed(1) + '%';
                document.getElementById('progressCount').textContent = 
                    `${data.current}/${data.total} (${data.percentage.toFixed(1)}%)`;
                document.getElementById('playerName').textContent = data.player;
                
                // Add to console (update last line if it's a progress update)
                const progressLine = `Processing: [${data.bar}] ${data.percentage.toFixed(1)}% | Player ${data.current}/${data.total}: ${data.player}`;
                
                // Only keep the last progress message to avoid cluttering
                const lines = consoleElement.innerHTML.split('\n');
                if (lines.length > 0 && lines[lines.length - 1].includes('Processing:')) {
                    lines[lines.length - 1] = progressLine;
                    consoleElement.innerHTML = lines.join('\n');
                } else {
                    consoleElement.innerHTML += progressLine + '\n';
                }
            } 
            else if (data.type === 'results') {
                // Display results
                document.getElementById('results').style.display = 'block';
                
                eventSource.close();
                
                // Save the analysis data for PDF generation
                window.analysisData = data;
                
                // Display each category
                ['points', 'rebounds', 'assists'].forEach(category => {
                    const resultDiv = document.getElementById(`${category}Results`);
                    const players = data[category];
                    
                    if (players.length === 0) {
                        resultDiv.innerHTML = `<p class="no-players">No players met the ${category} threshold criteria.</p>`;
                    } else {
                        const playerList = document.createElement('ol');
                        playerList.className = 'list-group list-group-flush';
                        playerList.style.paddingLeft = '30px';  // Add left padding for numbers
                        
                        // Get player IDs for each name
                        const playerIds = {};
                        data.player_ids.forEach(playerInfo => {
                            playerIds[playerInfo.name] = playerInfo.id;
                        });
                        
                        players.forEach(player => {
                            const item = document.createElement('li');
                            item.className = 'player-list-item';
                            item.innerHTML = `<i class="bi bi-person"></i> ${player}`;
                            
                            // Add data attribute for player ID if available
                            if (playerIds[player]) {
                                item.dataset.playerId = playerIds[player];
                                
                                // Add click event listener
                                item.addEventListener('click', function() {
                                    showPlayerStats(playerIds[player], player);
                                });
                            }
                            
                            playerList.appendChild(item);
                        });
                        
                        resultDiv.innerHTML = '';
                        resultDiv.appendChild(playerList);
                    }
                });
                
                // Add summary at the top of results with threshold info
                const summaryText = `
                    <div class="alert alert-info mb-4">
                        <h5><i class="bi bi-info-circle"></i> Analysis Summary</h5>
                        <p>Players who maintained consistency over their last ${data.thresholds.games} games:</p>
                        <ul>
                            <li><strong>Points:</strong> ${data.points.length} players with ${data.thresholds.points}+ points</li>
                            <li><strong>Rebounds:</strong> ${data.rebounds.length} players with ${data.thresholds.rebounds}+ rebounds</li>
                            <li><strong>Assists:</strong> ${data.assists.length} players with ${data.thresholds.assists}+ assists</li>
                        </ul>
                        <p class="mb-0"><small>Analysis completed on ${new Date().toLocaleString()}</small></p>
                    </div>
                `;
                document.getElementById('resultsContent').insertAdjacentHTML('afterbegin', summaryText);
            }
            else if (data.type === 'init' || data.type === 'season' || data.type === 'config' || data.type === 'players' || data.type === 'start') {
                // Add status messages
                const statusElement = document.getElementById('statusMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = 'alert alert-info mb-2 py-2';
                messageDiv.innerHTML = `<i class="bi bi-info-circle"></i> ${data.message}`;
                statusElement.appendChild(messageDiv);
                
                // Also add to console
                consoleElement.innerHTML += data.message + '\n';
            }
        };
        
        eventSource.onerror = function() {
            const consoleElement = document.getElementById('console');
            consoleElement.innerHTML += 'Connection error. Please try again.\n';
            eventSource.close();
        };
    });

    // Player Stats Modal Functions
    window.showPlayerStats = function(playerId, playerName) {
        document.getElementById('modalPlayerName').textContent = playerName;
        document.getElementById('statsTableBody').innerHTML = '<tr><td colspan="23" class="text-center">Loading player stats...</td></tr>';
        document.getElementById('playerStatsModal').style.display = 'block';
        
        // Fetch player stats
        fetch(`/player_stats/${playerId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('statsTableBody').innerHTML = 
                        `<tr><td colspan="23" class="text-center text-danger">Error: ${data.error}</td></tr>`;
                    return;
                }
                
                // Clear table body
                const tableBody = document.getElementById('statsTableBody');
                tableBody.innerHTML = '';
                
                // Add game rows
                data.games.forEach(game => {
                    const row = document.createElement('tr');
                    
                    // Format date (assuming format like "YYYY-MM-DD")
                    const dateObj = new Date(game.game_date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Create cells
                    row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${game.matchup}</td>
                        <td class="wl-${game.wl.toLowerCase()}">${game.wl}</td>
                        <td>${game.min}</td>
                        <td>${game.pts}</td>
                        <td>${game.fgm}</td>
                        <td>${game.fga}</td>
                        <td>${game.fg_pct.toFixed(1)}</td>
                        <td>${game.fg3m}</td>
                        <td>${game.fg3a}</td>
                        <td>${game.fg3_pct.toFixed(1)}</td>
                        <td>${game.ftm}</td>
                        <td>${game.fta}</td>
                        <td>${game.ft_pct.toFixed(1)}</td>
                        <td>${game.oreb}</td>
                        <td>${game.dreb}</td>
                        <td>${game.reb}</td>
                        <td>${game.ast}</td>
                        <td>${game.stl}</td>
                        <td>${game.blk}</td>
                        <td>${game.tov}</td>
                        <td>${game.pf}</td>
                        <td>${game.plus_minus}</td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                if (data.games.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="23" class="text-center">No game data available</td></tr>';
                }
            })
            .catch(error => {
                document.getElementById('statsTableBody').innerHTML = 
                    `<tr><td colspan="23" class="text-center text-danger">Error fetching data: ${error}</td></tr>`;
            });
    }
    
    // Close modal when clicking the X
    document.querySelector('.stats-modal-close').addEventListener('click', function() {
        document.getElementById('playerStatsModal').style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('playerStatsModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // PDF Generation
    document.getElementById('downloadPdf').addEventListener('click', function() {
        try {
            // Proper way to access jsPDF from the UMD module
            const { jsPDF } = window.jspdf;
            
            // Add a temporary loading message
            const loadingMsg = document.createElement('div');
            loadingMsg.className = 'alert alert-info text-center';
            loadingMsg.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating PDF, please wait...';
            document.body.appendChild(loadingMsg);
            
            // Create PDF document
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15; // margin in mm
            const usableWidth = pageWidth - (margin * 2);
            
            // Set font sizes
            const titleSize = 18;
            const headingSize = 14;
            const normalSize = 12;
            const smallSize = 10;
            
            // Helper function for text wrapping
            function addWrappedText(text, x, y, maxWidth, fontSize, font = 'helvetica') {
                pdf.setFont(font);
                pdf.setFontSize(fontSize);
                
                const textLines = pdf.splitTextToSize(text, maxWidth);
                pdf.text(textLines, x, y);
                
                return textLines.length;
            }
            
            // Function to check if we need a new page
            function checkForNewPage(currentY, neededSpace) {
                if (currentY + neededSpace > pageHeight - margin) {
                    pdf.addPage();
                    return margin + 10; // Reset Y position with a bit of spacing
                }
                return currentY;
            }
            
            // Start Y position
            let yPos = margin + 10;
            
            // Add title
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(titleSize);
            pdf.setTextColor(23, 64, 139); // NBA blue
            pdf.text('NBA Player Consistency Analysis', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;
            
            // Add timestamp
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(smallSize);
            pdf.setTextColor(100, 100, 100);
            const timestamp = `Generated on: ${new Date().toLocaleString()}`;
            pdf.text(timestamp, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;
            
            // Add analysis criteria if available
            if (window.analysisData && window.analysisData.thresholds) {
                yPos = checkForNewPage(yPos, 40);
                
                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(248, 249, 250);
                pdf.roundedRect(margin, yPos - 5, usableWidth, 35, 3, 3, 'FD');
                
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(headingSize);
                pdf.setTextColor(0, 0, 0);
                pdf.text('Analysis Criteria', margin + 5, yPos);
                yPos += 7;
                
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(normalSize);
                pdf.text(`Games analyzed: ${window.analysisData.thresholds.games}`, margin + 5, yPos);
                yPos += 6;
                
                pdf.text(`Points threshold: ${window.analysisData.thresholds.points}+`, margin + 5, yPos);
                yPos += 6;
                
                pdf.text(`Rebounds threshold: ${window.analysisData.thresholds.rebounds}+`, margin + 5, yPos);
                yPos += 6;
                
                pdf.text(`Assists threshold: ${window.analysisData.thresholds.assists}+`, margin + 5, yPos);
                yPos += 15;
            }
            
            // Add each category with players
            ['points', 'rebounds', 'assists'].forEach(category => {
                if (!window.analysisData || !window.analysisData[category]) return;
                
                const players = window.analysisData[category];
                const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
                const threshold = window.analysisData?.thresholds?.[category] || '';
                
                // Check if we need a new page for this category (heading + some items)
                yPos = checkForNewPage(yPos, 30);
                
                // Add category heading
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(headingSize);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`${categoryTitle} Consistency (${threshold}+)`, margin, yPos);
                
                // Draw underline
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, yPos + 1, margin + usableWidth, yPos + 1);
                yPos += 10;
                
                // Add players or "no players" message
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(normalSize);
                
                if (players.length === 0) {
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`No players met the ${category} threshold criteria.`, margin, yPos);
                    yPos += 10;
                } else {
                    // Process players in batches to allow pagination
                    for (let i = 0; i < players.length; i++) {
                        // Check if we need a new page for this player
                        yPos = checkForNewPage(yPos, 6);
                        
                        pdf.setTextColor(0, 0, 0);
                        pdf.text(`${i+1}. ${players[i]}`, margin + 5, yPos);
                        yPos += 6;
                        
                        // After every 30 players, add extra space
                        if ((i + 1) % 30 === 0) {
                            yPos += 3;
                        }
                    }
                    yPos += 10; // Extra space after the list
                }
            });
            
            // Save the PDF
            try {
                pdf.save('nba-consistency-analysis.pdf');
                document.body.removeChild(loadingMsg);
            } catch (err) {
                console.error('Error saving PDF:', err);
                document.body.removeChild(loadingMsg);
                alert('Error saving the PDF. Please try again or use a different browser.');
            }
        } catch (error) {
            console.error('PDF initialization error:', error);
            alert('Could not create PDF. Please ensure you\'re using a modern browser like Chrome or Edge.');
        }
    });
});
