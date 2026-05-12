import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Library,
  LogOut,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  UserPlus,
  Users,
} from 'lucide-react';
import './styles.css';

const API_URL = 'http://localhost:8080';
const SESSION_KEY = 'library_user';

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.details ? Object.values(data.details).join(', ') : data?.message;
    throw new Error(detail || 'Request failed');
  }
  return data;
}

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    try {
      const parsedUser = JSON.parse(saved);
      if (!parsedUser || !['LIBRARIAN', 'MEMBER'].includes(parsedUser.role) || !parsedUser.name) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsedUser;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });

  const login = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!user) {
    return <AuthScreen onLogin={login} />;
  }

  return user.role === 'LIBRARIAN'
    ? <LibrarianDashboard user={user} onLogout={logout} />
    : <MemberDashboard user={user} onLogout={logout} />;
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('member-login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';
  const loginRole = mode === 'librarian-login' ? 'LIBRARIAN' : 'MEMBER';

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const path = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister
        ? { ...form, role: 'MEMBER' }
        : { email: form.email, password: form.password, role: loginRole };
      const account = await api(path, { method: 'POST', body: JSON.stringify(body) });
      onLogin(account);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div>
          <span className="eyebrow">College library</span>
          <h1>{mode === 'librarian-login' ? 'Librarian Login' : mode === 'member-login' ? 'Member Login' : 'Member Register'}</h1>
        </div>
        <div className="auth-tabs">
          <button className={mode === 'librarian-login' ? 'active' : ''} onClick={() => setMode('librarian-login')} type="button">Librarian Login</button>
          <button className={mode === 'member-login' ? 'active' : ''} onClick={() => setMode('member-login')} type="button">Member Login</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">Register</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {isRegister && (
            <input placeholder="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, role: 'MEMBER' })} />
          )}
          <input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button type="submit" disabled={loading}>
            <Send size={16} /> {isRegister ? 'Register Member' : 'Login'}
          </button>
        </form>
        {message && <div className="notice">{message}</div>}
      </section>
    </main>
  );
}

function LibrarianDashboard({ user, onLogout }) {
  const library = useLibraryData();
  const [activeView, setActiveView] = useState('overview');
  const [bookForm, setBookForm] = useState({ title: '', author: '' });
  const [memberForm, setMemberForm] = useState({ name: '', email: '' });
  const [issueForm, setIssueForm] = useState({ bookId: '', memberId: '' });

  const activeIssues = useMemo(() => library.issues.filter((issue) => !issue.returnDate), [library.issues]);
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Library },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'issue', label: 'Issue & Return', icon: RotateCcw },
    { id: 'members', label: 'Members', icon: Users },
  ];

  const submitBook = async (event) => {
    event.preventDefault();
    await library.runAction(async () => {
      await api('/books', { method: 'POST', body: JSON.stringify(bookForm) });
      setBookForm({ title: '', author: '' });
      return 'Book added';
    });
  };

  const submitMember = async (event) => {
    event.preventDefault();
    await library.runAction(async () => {
      await api('/members', { method: 'POST', body: JSON.stringify(memberForm) });
      setMemberForm({ name: '', email: '' });
      return 'Member registered';
    });
  };

  const submitIssue = async (event) => {
    event.preventDefault();
    await library.runAction(async () => {
      await api('/issues/issue', { method: 'POST', body: JSON.stringify(issueForm) });
      setIssueForm({ bookId: '', memberId: '' });
      return 'Book issued';
    });
  };

  return (
    <DashboardShell user={user} title="Librarian Dashboard" navItems={navItems} activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} onRefresh={library.loadData} loading={library.loading}>
      <Message text={library.message} />

      {activeView === 'overview' && (
        <>
          <Stats books={library.books} members={library.members} activeIssues={activeIssues} />
          <section className="content-grid">
            <BooksPanel library={library} />
            <IssuesPanel issues={activeIssues} onReturn={(issueId) => library.returnBook(issueId)} showMember />
          </section>
        </>
      )}

      {activeView === 'books' && (
        <section className="content-grid single-wide">
          <form className="panel" onSubmit={submitBook}>
            <h2>Add book</h2>
            <input placeholder="Title" value={bookForm.title} onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })} />
            <input placeholder="Author" value={bookForm.author} onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })} />
            <button type="submit"><Send size={16} /> Add Book</button>
          </form>
          <BooksPanel library={library} />
        </section>
      )}

      {activeView === 'issue' && (
        <section className="content-grid">
          <form className="panel" onSubmit={submitIssue}>
            <h2>Issue book</h2>
            <BookSelect books={library.books} value={issueForm.bookId} onChange={(bookId) => setIssueForm({ ...issueForm, bookId })} />
            <select value={issueForm.memberId} onChange={(event) => setIssueForm({ ...issueForm, memberId: event.target.value })}>
              <option value="">Member</option>
              {library.members.map((member) => (
                <option key={member.memberId} value={member.memberId}>{member.name}</option>
              ))}
            </select>
            <button type="submit"><BookOpen size={16} /> Issue Book</button>
          </form>
          <IssuesPanel issues={activeIssues} onReturn={(issueId) => library.returnBook(issueId)} showMember />
        </section>
      )}

      {activeView === 'members' && (
        <section className="content-grid">
          <form className="panel" onSubmit={submitMember}>
            <h2>Register member</h2>
            <input placeholder="Name" value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} />
            <input placeholder="Email" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} />
            <button type="submit"><UserPlus size={16} /> Register Member</button>
          </form>
          <MembersPanel members={library.members} />
        </section>
      )}
    </DashboardShell>
  );
}

function MemberDashboard({ user, onLogout }) {
  const library = useLibraryData(user.memberId);
  const myIssues = useMemo(() => library.memberIssues.filter((issue) => !issue.returnDate), [library.memberIssues]);
  const [activeView, setActiveView] = useState('overview');
  const [selectedBookId, setSelectedBookId] = useState('');
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Library },
    { id: 'books', label: 'Browse Books', icon: BookOpen },
    { id: 'issues', label: 'My Issues', icon: RotateCcw },
  ];

  const issueBook = async (event) => {
    event.preventDefault();
    await library.runAction(async () => {
      await api('/issues/issue', {
        method: 'POST',
        body: JSON.stringify({ bookId: selectedBookId, memberId: user.memberId }),
      });
      setSelectedBookId('');
      return 'Book issued to your account';
    });
  };

  return (
    <DashboardShell user={user} title="Member Dashboard" navItems={navItems} activeView={activeView} onViewChange={setActiveView} onLogout={onLogout} onRefresh={library.loadData} loading={library.loading}>
      <Message text={library.message} />

      {activeView === 'overview' && (
        <>
          <section className="stats-grid">
            <Stat icon={<Library />} label="Books" value={library.books.length} />
            <Stat icon={<CheckCircle2 />} label="Available" value={library.books.filter((book) => book.availability).length} />
            <Stat icon={<BookOpen />} label="My active issues" value={myIssues.length} />
          </section>
          <section className="content-grid">
            <BooksPanel library={library} />
            <IssuesPanel issues={myIssues} onReturn={(issueId) => library.returnBook(issueId)} />
          </section>
        </>
      )}

      {activeView === 'books' && (
        <section className="content-grid">
          <form className="panel" onSubmit={issueBook}>
            <h2>Issue available book</h2>
            <BookSelect books={library.books} value={selectedBookId} onChange={setSelectedBookId} />
            <button type="submit"><BookOpen size={16} /> Issue to me</button>
          </form>
          <BooksPanel library={library} />
        </section>
      )}

      {activeView === 'issues' && (
        <section className="content-grid single-wide">
          <IssuesPanel issues={myIssues} onReturn={(issueId) => library.returnBook(issueId)} />
        </section>
      )}
    </DashboardShell>
  );
}

function useLibraryData(memberId) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [memberIssues, setMemberIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const bookPath = search.trim() ? `/books?search=${encodeURIComponent(search.trim())}` : '/books';
      const requests = [api(bookPath), api('/members'), api('/issues')];
      if (memberId) {
        requests.push(api(`/members/${memberId}/issues`));
      }
      const [bookData, memberData, issueData, memberIssueData = []] = await Promise.all(requests);
      setBooks(bookData);
      setMembers(memberData);
      setIssues(issueData);
      setMemberIssues(memberIssueData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (action) => {
    setLoading(true);
    try {
      const successMessage = await action();
      setMessage(successMessage);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (issueId) => {
    await runAction(async () => {
      await api(`/issues/return/${issueId}`, { method: 'PUT' });
      return 'Book returned';
    });
  };

  return {
    books,
    members,
    issues,
    memberIssues,
    search,
    setSearch,
    message,
    loading,
    loadData,
    runAction,
    returnBook,
  };
}

function DashboardShell({ user, title, navItems, activeView, onViewChange, children, onLogout, onRefresh, loading }) {
  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Library size={22} />
          <strong>Library</strong>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={activeView === item.id ? 'active' : ''} key={item.id} onClick={() => onViewChange(item.id)} type="button">
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span>{user.name}</span>
          <small>{user.role.toLowerCase()}</small>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
      <section className="app-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">{user.role.toLowerCase()}</span>
            <h1>{title}</h1>
            <p className="welcome">Signed in as {user.name}</p>
          </div>
          <button className="icon-button" onClick={onRefresh} disabled={loading} title="Refresh">
            <RefreshCw size={18} />
          </button>
        </header>
        {children}
      </section>
    </main>
  );
}

function Stats({ books, members, activeIssues }) {
  return (
    <section className="stats-grid">
      <Stat icon={<Library />} label="Books" value={books.length} />
      <Stat icon={<CheckCircle2 />} label="Available" value={books.filter((book) => book.availability).length} />
      <Stat icon={<Users />} label="Members" value={members.length} />
      <Stat icon={<BookOpen />} label="Active issues" value={activeIssues.length} />
    </section>
  );
}

function BooksPanel({ library }) {
  return (
    <div className="table-panel">
      <div className="section-head">
        <h2>Books</h2>
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Search title or author"
            value={library.search}
            onChange={(event) => library.setSearch(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && library.loadData()}
          />
        </label>
      </div>
      <DataTable
        headers={['Title', 'Author', 'Status']}
        rows={library.books.map((book) => [book.title, book.author, <Status available={book.availability} />])}
      />
    </div>
  );
}

function MembersPanel({ members }) {
  return (
    <div className="table-panel">
      <div className="section-head">
        <h2>Members</h2>
      </div>
      <DataTable
        headers={['Name', 'Email']}
        rows={members.map((member) => [member.name, member.email])}
      />
    </div>
  );
}

function IssuesPanel({ issues, onReturn, showMember = false }) {
  return (
    <div className="table-panel">
      <div className="section-head">
        <h2>{showMember ? 'Active issues' : 'My issued books'}</h2>
      </div>
      <div className="issue-list">
        {issues.map((issue) => (
          <article className="issue-card" key={issue.issueId}>
            <div>
              <strong>{issue.book.title}</strong>
              <span>{showMember ? `${issue.member.name} - ` : ''}{issue.issueDate}</span>
            </div>
            <button className="return-button" onClick={() => onReturn(issue.issueId)} title="Return book">
              <RotateCcw size={16} /> Return
            </button>
          </article>
        ))}
        {issues.length === 0 && <p className="empty">No active issues</p>}
      </div>
    </div>
  );
}

function BookSelect({ books, value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Available book</option>
      {books.filter((book) => book.availability).map((book) => (
        <option key={book.bookId} value={book.bookId}>{book.title}</option>
      ))}
    </select>
  );
}

function Message({ text }) {
  return text ? <div className="notice">{text}</div> : null;
}

function Stat({ icon, label, value }) {
  return (
    <article className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Status({ available }) {
  return <span className={available ? 'badge available' : 'badge issued'}>{available ? 'Available' : 'Issued'}</span>;
}

function DataTable({ headers, rows }) {
  return (
    <table>
      <thead>
        <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

createRoot(document.getElementById('root')).render(<App />);
