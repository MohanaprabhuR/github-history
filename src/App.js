import { useState } from "react";
import Axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    searchRepos();
  }

  function searchRepos() {
    setLoading(true);
    setError("");
    setRepos([]);
    setUserInfo(null);

    if (!username.trim()) {
      setError("Please enter a GitHub username");
      setLoading(false);
      return;
    }
    Axios({
      method: "get",
      url: `https://api.github.com/users/${username}`,
    })
      .then((userRes) => {
        setUserInfo(userRes.data);
        return Axios({
          method: "get",
          url: `https://api.github.com/users/${username}/repos`,
        });
      })
      .then((res) => {
        const repoData = res.data.map(repo => ({
          name: repo.name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          size: repo.size,
          id: repo.id,
          html_url: repo.html_url
        }));

        if (repoData.length === 0) {
          setError("This user has no public repositories");
        } else {
          setRepos(repoData);
        }
      })
      .catch((error) => {
        if (error.response) {
          switch (error.response.status) {
            case 404:
              setError("User not found. Please check the username and try again.");
              break;
            case 403:
              setError("API rate limit exceeded. Please try again later.");
              break;
            default:
              setError(`Error: ${error.response.data.message || 'Failed to fetch repositories'}`);
          }
        } else if (error.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("An unexpected error occurred.");
        }
        setRepos([]);
        setUserInfo(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function renderRepo(repo) {
    return (
      <li key={repo.id} className="list-none">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white hover:text-gray-200 p-3 rounded-xl bg-[#00342d] text-white hover:bg-[#004d3d] transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {repo.name}
        </a>
      </li>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold my-12 text-center">GitHub Commit Chart</h1>
      <div className="text-center w-full max-w-[800px] mx-auto rounded-xl bg-[#f5f5f2] p-4">
        <form className="flex gap-[0_8px] w-full" onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            className="p-3 w-full border border-solid border-gray-300 rounded-lg 
            focus:outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200
            hover:border-gray-400 transition-colors
            placeholder:text-gray-400"
            placeholder="Enter your github username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="py-3 px-8 rounded-lg bg-[#0b2033] text-white hover:bg-[#1a3346] transition-colors"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {userInfo && (
          <div className="mt-8 flex items-center justify-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
            <img 
              src={userInfo.avatar_url} 
              alt={`${username}'s avatar`}
              className="w-20 h-20 rounded-full border-2 border-gray-200"
            />
            <div className="text-left">
              <h2 className="text-xl font-bold">{userInfo.name || username}</h2>
              <p className="text-gray-600">{userInfo.bio || 'No bio available'}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>👥 {userInfo.followers} followers</span>
                <span>👤 {userInfo.following} following</span>
                <span>📚 {userInfo.public_repos} repos</span>
              </div>
            </div>
          </div>
        )}

        {repos.length > 0 && (
          <>
            <div className="flex flex-wrap gap-4 mt-10">{repos.map(renderRepo)}</div>

            <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
              <h2 className="text-xl font-bold mb-4">Repository Statistics</h2>
              <div className="overflow-x-auto">
                <BarChart
                  width={1100}
                  height={500}
                  data={repos}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  className="mx-auto"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px'
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                  <Bar
                    dataKey="stars"
                    fill="#8884d8"
                    name="Stars"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="forks"
                    fill="#82ca9d"
                    name="Forks"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
