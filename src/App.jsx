import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/employees";
const ROWS_OPTIONS = [5, 10, 20, 30, 50, 100, 150];

function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState(null); // null | "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch from json-server on mount (no localStorage)
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed with status " + res.status);
        return res.json();
      })
      .then((employees) => {
        setData(employees);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          "Could not load employees. Make sure json-server is running on port 5000. (" +
            err.message +
            ")"
        );
        setLoading(false);
      });
  }, []);

  // 1. FILTER - Name only
  const query = searchQuery.trim().toLowerCase();
  const filteredData = data.filter((employee) =>
    employee.name.toLowerCase().includes(query)
  );

  // 2. SORT - Salary only (copy first so state isn't mutated)
  const sortedData = filteredData.slice().sort((a, b) => {
    if (sortDirection === "asc") return a.salary - b.salary;
    if (sortDirection === "desc") return b.salary - a.salary;
    return 0;
  });

  // 3. SLICE - rows for the current page
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const pageData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  // Toggle Low-to-High <-> High-to-Low
  const handleSalarySort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const handleRowsChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const sortIcon =
    sortDirection === "asc" ? "▲" : sortDirection === "desc" ? "▼" : "↕";

  return (
    <div className="container-fluid px-3">
      <div className="employees-wrapper">
        <h1 className="employees-title h3">Employees</h1>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Search by Name..."
          value={searchQuery}
          onChange={handleSearch}
        />

        <div className="table-responsive">
          <table className="table table-bordered employees-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Position</th>
                <th className="salary-header" onClick={handleSalarySort}>
                  Salary<span className="sort-icon">{sortIcon}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="empty-row">
                  <td colSpan={7}>Loading...</td>
                </tr>
              )}
              {error && (
                <tr className="empty-row">
                  <td colSpan={7}>{error}</td>
                </tr>
              )}
              {!loading && !error && pageData.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={7}>No employees match that name.</td>
                </tr>
              )}
              {pageData.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.employeeId}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>${employee.salary.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-footer d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="rowsPerPage" className="mb-0">
              Pages per data
            </label>
            <select
              id="rowsPerPage"
              className="form-select form-select-sm"
              value={rowsPerPage}
              onChange={handleRowsChange}
            >
              {ROWS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="page-text">
            Page {safePage} of {totalPages}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
