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
        alert(`Login successful! Welcome ${data.name}`);
        window.location.href = 'members.html';
      } else {
        alert(`Login failed: ${data.message || 'Invalid credentials is here'}`);
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

// LOAN FORM

const loanForm = document.getElementById('loanForm');
if (loanForm) {
  loanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const durationMonths = parseInt(document.getElementById('durationMonths').value, 10);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, durationMonths })
      });

      if (!res.ok) throw new Error('Loan request failed');
      const data = await res.json();

      const date = new Date(data.endDate);
     const formattedEndDate = `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

     alert(`Loan of ₦${data.amount} for ${data.durationMonths} months applied successfully at ${data.interestRate}% interest! End date: ${formattedEndDate}`);
      loanForm.reset();
    
    } catch (err) {
      alert('Error applying for loan: ' + err.message);
    }
  });
}

const loanList = document.getElementById('loanList');
if (loanList) {
  async function loadLoans() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load loans');
      const loans = await res.json();

      loanList.innerHTML = '';
      loans.forEach(loan => {
        const date = new Date(loan.endDate);
        const formattedEndDate = `${String(date.getFullYear()).slice(-2)}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `Amount: ₦${loan.amount}, Duration: ${loan.durationMonths} months, Interest: ${loan.interestRate}%, End Date: ${formattedEndDate}, Status: ${loan.status}`;
        loanList.appendChild(li);
      });
    } catch (err) {
      console.error('Load loans error:', err);
      loanList.innerHTML = '<li class="list-group-item text-muted">No loans found or failed to load.</li>';
    }
  }
  loadLoans();
}




// CONTRIBUTION FORM
const contributionForm = document.getElementById('contributionForm');
if (contributionForm) {
  contributionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('contributionAmount').value;
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:5000/api/contributions/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    alert(`Contribution of ₦${data.amount} added successfully!`);
  });

  async function loadContributions() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/contributions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const contributions = await res.json();
    const list = document.getElementById('contributionList');
    list.innerHTML = '';
    contributions.forEach(c => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = `₦${c.amount} - ${new Date(c.date).toLocaleDateString()}`;
      list.appendChild(li);
    });
  }
  loadContributions();
}



