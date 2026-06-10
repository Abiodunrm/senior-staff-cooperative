// main.js

// REGISTER FORM HANDLER
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const contribution = document.getElementById('contribution').value;

    try {
      const res = await fetch('http://localhost:5000/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, contribution })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Welcome ${data.name}, you are registered!`);
        registerForm.reset();
      } else {
        alert(`Error: ${data.message || 'Registration failed'}`);
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert(`Error registering member: ${err.message}`);
    }
  });
}

// LOGIN FORM HANDLER
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('http://localhost:5000/api/members/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.email); // save email for later checks
        alert(`Login successful! Welcome ${data.name}`);

        // Check if this user is admin
        if (data.email === "rotimiabiodun70@gmail.com") { // must match ADMIN_EMAIL in .env
          window.location.href = 'admin.html'; // redirect to admin dashboard
        } else {
          window.location.href = 'loan.html';
        }
      } else {
        alert(`Login failed: ${data.message || 'Invalid credentials'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(`Error logging in: ${err.message}`);
    }
  });
}



// MEMBERS LIST PAGE HANDLER
const memberList = document.getElementById('memberList');
if (memberList) {
  async function loadMembers() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const members = await res.json();
      memberList.innerHTML = '';
      members.forEach(m => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = `${m.name} - ${m.email} - ₦${m.contribution}`;
        memberList.appendChild(li);
      });
    } catch (err) {
      alert('Error loading members');
    }
  }
  loadMembers();
}



// LOAN FORM handler

// LOAN FORM
const loanForm = document.getElementById('loanForm');
if (loanForm) {
  loanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const durationMonths = parseInt(document.getElementById('durationMonths').value, 10);
    const loanType = document.getElementById('loanType').value; // new dropdown
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, durationMonths, loanType })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(`Error applying for loan: ${data.message}`);
        return;
      }
//succesful messages
      const date = new Date(data.endDate);
      const formattedEndDate = `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

      alert(`Loan of ₦${data.amount} (${data.loanType}) for ${data.durationMonths} months applied successfully at ${data.interestRate}% interest!
Total Repayment: ₦${data.repaymentAmount.toFixed(2)}
Monthly Repayment: ₦${data.monthlyRepayment.toFixed(2)}
End Date: ${formattedEndDate}`);
    } catch (err) {
      alert('Error applying for loan: ' + err.message);
    }
  });
}


//loan list handler

const loanList = document.getElementById('loanList');
const repaymentList = document.getElementById('repaymentList');

if (loanList && repaymentList) {
  async function loadLoans() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load loans');
      const loans = await res.json();

      loanList.innerHTML = '';
      repaymentList.innerHTML = '';

      loans.forEach(loan => {
        const endDate = new Date(loan.endDate);
        const formattedEndDate = `${String(endDate.getFullYear()).slice(-2)}/${String(endDate.getMonth() + 1).padStart(2, '0')}/${String(endDate.getDate()).padStart(2, '0')}`;

        const startDate = new Date(loan.startDate);
        const formattedStartDate = `${String(startDate.getFullYear()).slice(-2)}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${String(startDate.getDate()).padStart(2, '0')}`;

        // Loan list item
        const loanItem = document.createElement('li');
        loanItem.className = 'list-group-item';
        loanItem.innerHTML = `Type: ${loan.loanType}, Amount: ₦${loan.amount}, Duration: ${loan.durationMonths} months, Interest: ${loan.interestRate}%, End Date: ${formattedEndDate}, Status: ${loan.status}`;
        loanList.appendChild(loanItem);

        // Repayment list item
        const repaymentItem = document.createElement('li');
        repaymentItem.className = 'list-group-item';
        repaymentItem.innerHTML = `
          Loan Type: ${loan.loanType}, 
          Loan Amount: ₦${loan.amount}, 
          Start Date: ${formattedStartDate}, 
          End Date: ${formattedEndDate}, 
          Total Repayment: ₦${loan.repaymentAmount?.toFixed(2)}, 
          Monthly Repayment: ₦${loan.monthlyRepayment?.toFixed(2)}
        `;
        repaymentList.appendChild(repaymentItem);

        if (loan.repaymentSchedule && loan.repaymentSchedule.length > 0) {
          const scheduleUl = document.createElement('ul');
          scheduleUl.className = 'mt-2';
          loan.repaymentSchedule.forEach(item => {
            const dueDate = new Date(item.dueDate);
            const formattedDueDate = `${String(dueDate.getFullYear()).slice(-2)}/${String(dueDate.getMonth() + 1).padStart(2, '0')}/${String(dueDate.getDate()).padStart(2, '0')}`;
            const scheduleLi = document.createElement('li');
            scheduleLi.innerText = `Month ${item.month}: Due ${formattedDueDate}, Amount ₦${item.amount.toFixed(2)}`;
            scheduleUl.appendChild(scheduleLi);
          });
          repaymentItem.appendChild(scheduleUl);
        }
      });
    } catch (err) {
      console.error('Load loans error:', err);
      loanList.innerHTML = '<li class="list-group-item text-muted">No loans found or failed to load.</li>';
      repaymentList.innerHTML = '<li class="list-group-item text-muted">No repayment schedule found.</li>';
    }
  }
  loadLoans();
}




// CONTRIBUTION FORM HANDLER
const contributionForm = document.getElementById('contributionForm');
const memberSelect = document.getElementById('memberSelect');
const contributionList = document.getElementById('contributionList');
const totalContributionEl = document.getElementById('totalContribution');

async function loadContributions(memberId = '') {
  if (!contributionList || !totalContributionEl) return;

  const token = localStorage.getItem('token');
  try {
    const url = memberId
      ? `http://localhost:5000/api/contributions?memberId=${encodeURIComponent(memberId)}`
      : 'http://localhost:5000/api/contributions'; // members get their own contributions

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load contributions');

    const contributions = await res.json();
    contributionList.innerHTML = '';

    let total = 0;
    contributions.forEach(contribution => {
      const date = new Date(contribution.date);
      const formattedDate = `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      const memberName = contribution.member && contribution.member.name ? contribution.member.name : 'Unknown member';

      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `Member: ${memberName}, Amount: ₦${contribution.amount}, Date: ${formattedDate}`;
      contributionList.appendChild(li);

      total += Number(contribution.amount) || 0;
    });

    totalContributionEl.innerText = `Total Contribution: ₦${total}`;
  } catch (err) {
    console.error('Load contributions error:', err);
    contributionList.innerHTML = '<li class="list-group-item text-muted">No contributions found or failed to load.</li>';
    totalContributionEl.innerText = '';
  }
}

const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('token');

if (contributionForm) {
  if (userEmail !== 'rotimiabiodun70@gmail.com') {
    // Hide form for members
    contributionForm.style.display = 'none';
    // ✅ Load contributions for the logged-in member immediately
    loadContributions();
  } else {
    // Admin can add contributions
    contributionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const amount = document.getElementById('contributionAmount').value;
      const selectedMemberId = memberSelect ? memberSelect.value : '';
      try {
        const res = await fetch('http://localhost:5000/api/contributions/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount, memberId: selectedMemberId })
        });

        const data = await res.json();
        if (!res.ok) {
          alert(`Error: ${data.message}`);
          return;
        }

        alert(`Contribution of ₦${data.amount} added successfully for ${data.member.name}!`);
        contributionForm.reset();
        await loadContributions(selectedMemberId); // reload history for that member
      } catch (err) {
        console.error('Contribution error:', err);
        alert('Error adding contribution: ' + err.message);
      }
    });

    // Populate member dropdown for admin
    if (memberSelect) {
      fetch('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(members => {
          members.forEach(m => {
            const option = document.createElement('option');
            option.value = m._id;
            option.textContent = `${m.name} (${m.email})`;
            memberSelect.appendChild(option);
          });
        })
        .catch(err => console.error('Error loading members:', err));

      // Reload contributions when admin changes selected member
      memberSelect.addEventListener('change', () => loadContributions(memberSelect.value));
    }
  }
}

  


// ADMIN LOAN DASHBOARD
const adminLoanList = document.getElementById('adminLoanList');

// Define loadAllLoans at top-level so updateLoanStatus can access it
async function loadAllLoans() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:5000/api/loans', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load loans');
    const loans = await res.json();

    adminLoanList.innerHTML = '';
    loans.forEach(loan => {
      const endDate = loan.endDate ? new Date(loan.endDate) : null;
      const formattedEndDate = endDate
        ? `${String(endDate.getFullYear()).slice(-2)}/${String(endDate.getMonth() + 1).padStart(2, '0')}/${String(endDate.getDate()).padStart(2, '0')}`
        : 'N/A';

      const memberName = loan.member && loan.member.name ? loan.member.name : 'Unknown';
      const memberEmail = loan.member && loan.member.email ? loan.member.email : '';

      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${loan.loanType}</strong> - ₦${loan.amount}, ${loan.durationMonths} months
          <br>Status: <span class="badge bg-info">${loan.status}</span>
          <br>Member: ${memberName} (${memberEmail})
          <br>End Date: ${formattedEndDate}
        </div>
        <div>
          <button class="btn btn-sm btn-success me-2" onclick="updateLoanStatus('${loan._id}', 'approved')">Approve</button>
          <button class="btn btn-sm btn-warning me-2" onclick="updateLoanStatus('${loan._id}', 'repaid')">Mark Repaid</button>
          <button class="btn btn-sm btn-danger" onclick="updateLoanStatus('${loan._id}', 'rejected')">Reject</button>
        </div>
      `;
      adminLoanList.appendChild(li);
    });
  } catch (err) {
    console.error('Load loans error:', err);
    adminLoanList.innerHTML = '<li class="list-group-item text-muted">No loans found or failed to load.</li>';
  }
}

// Call on page load if adminLoanList exists
if (adminLoanList) {
  loadAllLoans();
}

// Update loan status
async function updateLoanStatus(loanId, status) {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`http://localhost:5000/api/loans/${loanId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Error updating loan: ${data.message}`);
      return;
    }
    alert(`Loan status updated to ${status}`);
    // ✅ Reload list without full page refresh
    loadAllLoans();
  } catch (err) {
    console.error('Update loan error:', err);
    alert('Error updating loan status: ' + err.message);
  }
}

// Show admin badge if logged-in user is admin
const adminLink = document.getElementById('adminLink');
if (adminLink) {
  const userEmail = localStorage.getItem('userEmail');
  if (userEmail === "rotimiabiodun70@gmail.com") { // must match ADMIN_EMAIL
    adminLink.style.display = 'block';
  }
}


// MEMBERS LIST HANDLER for admin only
const membersTableBody = document.getElementById('membersTableBody');
if (membersTableBody) {
  async function loadMembers() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load members');
      const members = await res.json();

      membersTableBody.innerHTML = '';
      members.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>₦${m.contribution || 0}</td>
        `;
        membersTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error('Load members error:', err);
      membersTableBody.innerHTML = '<tr><td colspan="3" class="text-muted">No members found or failed to load.</td></tr>';
    }
  }

  loadMembers();
}




