import { useState } from "react";
import Axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function App() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    searchRepos();
  }

  function searchRepos() {
    setLoading(true);
    Axios({
      method: "get",
      url: `https://api.github.com/users/${username}/repos`,
    }).then((res) => {
      const repoData = res.data.map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size: repo.size
      }));
      setLoading(false);
      setRepos(repoData);
    });
  }

  function renderRepo(repo) {
    return <li key={repo.id} className="list-none p-3 rounded-xl bg-[#00342d] text-white hover:bg-[#004d3d] transition-colors">{repo.name}</li>;
  }

  return (
    <div className="text-center w-full max-w-[1200px] mx-auto rounded-xl bg-[#f5f5f2] p-4">
      <form className="flex gap-[0_8px] w-full" onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          className="p-3 w-full border border-solid border-red-500 rounded-lg focus:outline-none focus:border-red-700"
          placeholder="Enter your github username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          type="submit"
          className="py-3 px-8 rounded-lg bg-[#0b2033] text-white hover:bg-[#1a3346] transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
      
      <div className="flex flex-wrap gap-4 mt-10">{repos.map(renderRepo)}</div>

      {repos.length > 0 && (
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
      )}
    </div>
  );
}

export default App;
