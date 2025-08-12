// Reservation Admin Functions - Updated for API Integration
// NOTE: Form submission is handled in main.js to avoid conflicts

// Using backend API with bearer auth
window.API_BASE = window.API_BASE || 'http://127.0.0.1:8000';
let reservations = [];

// Function to load reservations from API
async function loadReservationsFromAPI() {
    try {
        console.log('🔄 Loading reservations from API...');
        
        const response = await fetch(`${window.API_BASE}/admin/reservations`, {
            credentials: 'include',  // Send httpOnly cookie
            headers: {
                'Authorization': `Bearer ${window.authToken || ''}`  // Fallback to header if cookie fails
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiReservations = await response.json();
        
        // Accept both numeric and alphanumeric IDs as valid
        // Only filter out reservations with completely missing critical data
        const validReservations = apiReservations.filter(reservation => {
            // Allow any truthy ID (including 0, empty string gets document ID)
            const hasValidId = reservation.id !== undefined && reservation.id !== null;
            // Only require name OR email to exist (more lenient)
            const hasRequiredFields = (reservation.name && reservation.name.trim()) || (reservation.email && reservation.email.trim());
            
            const isValid = hasValidId && hasRequiredFields;
            
            if (!isValid) {
                console.log(`🗑️ Filtering out invalid reservation:`, {
                    id: reservation.id,
                    hasValidId,
                    hasRequiredFields,
                    name: reservation.name || 'missing',
                    email: reservation.email || 'missing'
                });
            } else {
                console.log(`✅ Keeping reservation:`, {
                    id: reservation.id,
                    name: reservation.name || 'missing',
                    email: reservation.email || 'missing'
                });
            }
            
            return isValid;
        });
        
        console.log(`✅ Loaded ${validReservations.length} valid reservations from API (filtered out ${apiReservations.length - validReservations.length} invalid entries)`);
        return validReservations;
    } catch (error) {
        console.error('❌ Error loading reservations from API:', error);
        return [];
    }
}

// Enhanced admin functions that work with API
async function updateReservationsList() {
    console.log('🔄 updateReservationsList called');
    const reservationsList = document.getElementById('reservationsList');
    if (!reservationsList) {
        console.error('❌ reservationsList element not found');
        return;
    }
    
    try {
        console.log('🔄 Starting to load reservations...');
        
        // Show loading message
        reservationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #007bff;">🔄 Loading reservations...</div>';
        
        // Load fresh data from API
        reservations = await loadReservationsFromAPI();
        console.log(`📊 Total reservations loaded: ${reservations.length}`);
        
        // Debug: Log each reservation
        reservations.forEach((res, index) => {
            console.log(`  ${index + 1}. ${res.name} (${res.email}) - ID: ${res.id} - Status: ${res.status || 'pending'}`);
        });
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        
        // Debug: Log filter values
        console.log(`🔍 Search filter: "${searchInput ? searchInput.value : 'none'}"`);
        console.log(`📊 Status filter: "${statusFilter ? statusFilter.value : 'none'}"`);
        
        let filteredReservations = [...reservations];
        
        // Apply search filter
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredReservations = filteredReservations.filter(res => 
                res.name.toLowerCase().includes(searchTerm) ||
                res.email.toLowerCase().includes(searchTerm) ||
                res.phone.includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (statusFilter && statusFilter.value !== 'all') {
            filteredReservations = filteredReservations.filter(res => 
                (res.status || '').toLowerCase() === statusFilter.value
            );
        }
        
        console.log(`📊 Filtered reservations: ${filteredReservations.length} out of ${reservations.length}`);
        
        // Display reservations (cards)
        if (filteredReservations.length === 0) {
            reservationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No reservations found.</div>';
        } else {
            reservationsList.innerHTML = '';
            filteredReservations.forEach(reservation => {
                const card = displayReservation(reservation);
                reservationsList.appendChild(card);
            });
        }

        // Also render table view for admin (non-destructive, added below cards)
        renderReservationsTable(filteredReservations);
        
    } catch (error) {
        console.error('❌ Error updating reservations list:', error);
        reservationsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Error loading reservations. Please try again.</div>';
    }
}

// Create and render admin table without changing existing UI
function renderReservationsTable(rows) {
    try {
        const managementSection = document.getElementById('managementSection');
        if (!managementSection) return;

        // Ensure table-specific styles override any global button styles
        ensureReservationsTableStyles();

        let container = document.getElementById('reservationsTableContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'reservationsTableContainer';
            container.style.marginTop = '12px';
            managementSection.appendChild(container);
        }

        let table = document.getElementById('reservations-table');
        if (!table) {
            container.innerHTML = `
              <table id="reservations-table" style="width:100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Guests</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th class="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>`;
            table = document.getElementById('reservations-table');

            const tbody = table.querySelector('tbody');
            tbody.addEventListener('click', async (e) => {
                const btn = e.target;
                const tr = btn.closest('tr');
                if (!tr) return;
                const id = tr.getAttribute('data-id');
                if (btn.classList.contains('action-confirm')) {
                    await updateReservationStatus(id, 'confirmed');
                    await updateReservationsList();
                } else if (btn.classList.contains('action-cancel')) {
                    await updateReservationStatus(id, 'cancelled');
                    await updateReservationsList();
                }
            });
        }

        const tbody = table.querySelector('tbody');
        const html = rows.map(r => `
            <tr data-id="${r.id}">
              <td>${window.escapeHtml ? escapeHtml(r.id || '') : (r.id || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.name || '') : (r.name || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.email || '') : (r.email || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.guests || '') : (r.guests || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.date || '') : (r.date || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.time || '') : (r.time || '')}</td>
              <td>${window.escapeHtml ? escapeHtml(r.status || 'pending') : (r.status || 'pending')}</td>
              <td class="actions-cell">
                <div class="actions-wrap">
                  <button class="action-confirm" ${((r.status||'').toLowerCase()==='confirmed') ? 'disabled' : ''}>Confirm</button>
                  <button class="action-cancel" ${((r.status||'').toLowerCase()==='cancelled'||(r.status||'').toLowerCase()==='confirmed') ? 'disabled' : ''}>Cancel</button>
                </div>
              </td>
            </tr>
        `).join('');
        tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;color:#666;">No reservations found.</td></tr>';
    } catch (err) {
        console.error('Error rendering reservations table:', err);
    }
}

function ensureReservationsTableStyles() {
    if (document.getElementById('reservations-table-inline-style')) return;
    const style = document.createElement('style');
    style.id = 'reservations-table-inline-style';
    style.textContent = `
      #reservations-table th.actions-header,
      #reservations-table td.actions-cell { width: 220px !important; min-width: 220px !important; }
      #reservations-table td.actions-cell { white-space: normal !important; vertical-align: middle; }
      #reservations-table td.actions-cell .actions-wrap { display:inline-flex; flex-wrap:nowrap; gap:8px; align-items:center; justify-content:flex-start; }
      #reservations-table td.actions-cell button { display:inline-flex !important; width:auto !important; padding:6px 10px !important; margin:0 !important; font-size:13px !important; line-height:1.2 !important; white-space:nowrap !important; }
    `;
    document.head.appendChild(style);
}

// Function to update reservation status via API
async function updateReservationStatus(id, newStatus) {
    try {
        console.log(`🔄 Updating reservation ${id} status to ${newStatus}`);
        
        const response = await fetch(`${window.API_BASE}/reservations/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.authToken || ''}`  // Fallback to header if cookie fails
            },
            credentials: 'include',  // Send httpOnly cookie
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Reservation status updated successfully:', result);
        
        // Refresh the reservations list
        await updateReservationsList();
        
        return true;
    } catch (error) {
        console.error('❌ Error updating reservation status:', error);
        alert(`Error updating reservation status: ${error.message}`);
        return false;
    }
}

// Function to delete reservation - not supported by backend
async function deleteReservation(id) {
    alert('Delete is not supported at this time. Please mark reservations as Cancelled instead.');
    return false;
}

// Export data from static database as CSV
async function exportReservationsData() {
    try {
        // Load fresh data from static database
        const allReservations = await loadReservationsFromAPI();
        
        if (allReservations.length === 0) {
            alert('No reservations to export');
            return;
        }
        
        // Define CSV headers
        const headers = [
            'Reservation ID',
            'Customer Name',
            'Email',
            'Phone',
            'Date',
            'Time',
            'Guests',
            'Status',
            'Occasion',
            'Special Requests',
            'Created Date',
            'Created Time'
        ];
        
        // Convert reservations to CSV rows
        const csvRows = allReservations.map(reservation => {
            const createdDate = new Date(reservation.createdAt);
            const formattedCreatedDate = createdDate.toLocaleDateString('en-IE');
            const formattedCreatedTime = createdDate.toLocaleTimeString('en-IE');
            
            return [
                reservation.id || '',
                reservation.name || '',
                reservation.email || '',
                reservation.phone || '',
                reservation.date || '',
                reservation.time || '',
                reservation.guests || '',
                reservation.status || 'pending',
                reservation.occasion || '',
                reservation.specialRequests || '',
                formattedCreatedDate,
                formattedCreatedTime
            ].map(field => {
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                const escaped = String(field).replace(/"/g, '""');
                return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
            });
        });
        
        // Combine headers and data
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const exportFileDefaultName = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.style.visibility = 'hidden';
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        
        // Clean up the object URL
        URL.revokeObjectURL(url);
        
        console.log(`Exported ${allReservations.length} reservations to CSV`);
        alert(`Successfully exported ${allReservations.length} reservations to ${exportFileDefaultName}`);
    } catch (error) {
        console.error('Error exporting reservations:', error);
        alert(`Error exporting data: ${error.message}`);
    }
}

// Export button listener is handled in main.js to avoid conflicts

// Initialize admin section - Try multiple times to ensure loading
function initializeAdminSystem() {
    console.log('🚀 Initializing admin reservation system...');
    
    // Check if management section is visible and load reservations
    const managementSection = document.getElementById('managementSection');
    if (managementSection && managementSection.style.display !== 'none') {
        console.log('📊 Management section is visible, loading reservations...');
        updateReservationsList();
        
        // Add event listeners for filters
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', updateReservationsList);
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', updateReservationsList);
        }
    } else {
        console.log('📊 Management section not visible yet');
    }
}

// Try to initialize multiple times with different delays
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, starting admin system initialization...');
    
    // Try immediately
    setTimeout(initializeAdminSystem, 100);
    
    // Try again after scripts load
    setTimeout(initializeAdminSystem, 1000);
    
    // Try once more after everything should be ready
    setTimeout(initializeAdminSystem, 2000);
    
    // Set up observer to watch for management section becoming visible
    let observerSetup = false;
    const setupVisibilityObserver = () => {
        if (observerSetup) return;
        
        const managementSection = document.getElementById('managementSection');
        if (managementSection) {
            observerSetup = true;
            
            // Use MutationObserver to watch for style changes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        if (target.style.display !== 'none') {
                            console.log('🔄 Management section became visible, loading reservations...');
                            updateReservationsList();
                        }
                    }
                });
            });
            
            observer.observe(managementSection, {
                attributes: true,
                attributeFilter: ['style']
            });
            
            console.log('👁️ Set up visibility observer for management section');
        }
    };
    
    // Try to set up observer immediately and after delays
    setupVisibilityObserver();
    setTimeout(setupVisibilityObserver, 1000);
    setTimeout(setupVisibilityObserver, 3000);
});

// Make functions globally available
window.reservationAdmin = {
    updateReservationsList,
    updateReservationStatus,
    deleteReservation,
    exportReservationsData,
    initializeAdminSystem
}; 