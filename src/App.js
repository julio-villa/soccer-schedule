import './App.css';
import axios, * as others from 'axios';
import { useState, useEffect } from 'react';
import { parseDate } from './Utils';
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from './components/globalStyles';
import { lightTheme, darkTheme } from "./components/Themes"
import { useCollapse } from 'react-collapsed';

function App() {
  // const promises = leagues.map(async (league) => {
  //   const info = await axios.get("https://site.api.espn.com/apis/site/v2/sports/soccer/" + league + "/scoreboard");
  //   return info; 
  // }); 

  // Using ESPN's API endpoint
  // Getting MLS match data between 2023/03/20 - 2023/05/20 example:
  // http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard?dates=20230320-20230520&limit=300

  // Getting matches for the next two weeks
  const leagueCodes = ["eng.1", "ita.1", "esp.1", "fra.1", "ger.1", "usa.1"];
  const [leagueInfo, setLeagueInfo] = useState([]);
  const [theme, setTheme] = useState('light');
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

  const themeToggler = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light')
  }

  var currentDate = new Date();
  var twoWeeksAhead = new Date()
  twoWeeksAhead.setDate(currentDate.getDate() + 14)

  // console.log(currentDate.toISOString() < twoWeeksAhead.toISOString());

  const currentDateString = parseDate(currentDate.toLocaleDateString());
  const twoWeeksAheadString = parseDate(twoWeeksAhead.toLocaleDateString());

  const getData = async () => {
    const leagues_info = await Promise.all(leagueCodes.map(async (league) => {
      // const info = await axios.get("https://site.api.espn.com/apis/site/v2/sports/soccer/" + league + "/scoreboard");
      var info = await axios.get("https://site.api.espn.com/apis/site/v2/sports/soccer/" + league + "/scoreboard?dates=" + currentDateString + "-" + twoWeeksAheadString + "&limit=300");
      var dateInfo = await axios.get("https://site.api.espn.com/apis/site/v2/sports/soccer/" + league + "/scoreboard");
      if (info.data.events.length === 0) {
        info.winner_info = await axios.get("https://site.api.espn.com/apis/v2/sports/soccer/" + league + "/standings?season=2022");
      }
      info.start_date = dateInfo.data.leagues[0].calendar[1];
      return info;
    }));
    return leagues_info;
  };

  const leaguesArray = [];

  const displayData = async () => {
    const data = await getData();
    // console.log(data);
    data.forEach(item => {
      leaguesArray.push({ start_date: item.start_date, league_name: item.data.leagues[0].name, logo: item.data.leagues[0].logos[0].href, events: item.data.events, winnerInfo: (item.winner_info ? item.winner_info : null) });
      setLeagueInfo(leaguesArray);
    })
  };

  useEffect(() => {
    displayData();
    console.log(leaguesArray);
    // console.log(leagueInfo);
  }, []);

  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme} >
      <>
        <GlobalStyles />
        <div className="App">
          <button onClick={themeToggler}>Switch Theme</button>

          <div>
            <button {...getToggleProps()}>
              {isExpanded ? 'Collapse' : 'Show all games in the next two weeks'}
            </button>
            <section {...getCollapseProps()}>
              Collapsed content 🙈
            </section>
          </div>

          <h1>Match info for the top 5 soccer leagues + MLS:</h1>
          <br></br>
          {leagueInfo.map(item => (
            <div className="league-section" key={item.league_name}>
              <div className='league-header'>
                <img src={item.logo} alt="image" style={{ width: 100, height: 100 }}></img>
                <h2> {item.league_name} </h2>
              </div>
              {item.events.length === 0 && currentDate.toISOString() < item.start_date ?
                <div>
                  <h4>Winner: {item.winnerInfo.data.children[0].standings.entries[0].team.displayName}</h4>
                </div> :
                item.events.length === 0 ?
                  <div>
                    <h4>No matches scheduled</h4>
                  </div> :
                  // else
                  <div>
                    {item.events.map(event => (
                      <div>
                        <h4>{event.name}</h4>
                        <h5>On {event.date.slice(0, 10)}</h5>
                      </div>
                    ))}
                  </div>
                //
              }
            </div>
          ))}
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
