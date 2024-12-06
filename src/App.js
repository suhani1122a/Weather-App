import hotBg from "./images/hott.jpg";
import coldBg from "./images/cool.jpg";
import Descriptions from "./components/Descriptions";
import { useEffect, useState, useCallback, useMemo } from "react";
import { getFormattedWeatherData } from "./weatherService";
import allcities from "./city.list.json";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// ... (previous imports)

function App() {
  const [city, setCity] = useState("State of Jammu and Kashmīr");
  const [weather, setWeather] = useState(null);
  const [units, setUnits] = useState("metric");
  const [bg, setBg] = useState(hotBg);
  const [allcity, setAllcities] = useState([]);
  const [searchcity, setSearchcity] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);

  useEffect(() => {
    const allCitiesArray = allcities.map((cityObj) => cityObj.name);
    setAllcities(allCitiesArray);
    
  }, []);

  const handleInputChange = useCallback(
    debounce((event) => {
      const input = event.target.value.toLowerCase();
      setSearchcity(input);
    }, 500),
    []
  );

  useEffect(() => {
    setFilteredCities([]); // Clear the filteredCities array when city changes

    const fetchWeatherData = async () => {
      try {
        const data = await getFormattedWeatherData(city, units);

        if (data) {
          setWeather((prevWeather) => ({
            ...prevWeather,
            ...data,
          }));

          const threshold = units === "metric" ? 20 : 60;
          setBg(data.temp <= threshold ? coldBg : hotBg);
        } else {
          console.error("City not found.");
        }
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    fetchWeatherData();
  }, [city, units]);

  useEffect(() => {
    setFilteredCities(
      allcity
        .filter((cityName) => cityName.toLowerCase().includes(searchcity))
        .slice(0, 10)
    );
  }, [allcity, searchcity]);

  const enterKeyPressed = useCallback(
    debounce((e) => {
      if (e.keyCode === 13) {
        setCity(e.target.value);
        e.target.blur();
      }
    }, 500),
    []
  );

  return (
    <div className="app" style={{ backgroundImage: `url(${bg})` }}>
      <div className="overlay">
        {weather && (
          <div className="container">
            <div className="section section__inputs">
              <input
              id="change"
                onKeyDown={enterKeyPressed}
                onChange={handleInputChange}
                type="text"
                name="city"
                placeholder="Enter City..."
                
              />
            </div>
            {(searchcity.length > 1 && filteredCities.length===0 ) ? (<></>):searchcity.length > 1 && (
              <div className="citylist">
                {filteredCities.map((cityName) => (
                  <div
                    className="modify"
                    key={cityName}
                    onClick={() => {setCity(cityName) ;
                      document.getElementById("change").value=cityName;
                      setFilteredCities([]);
                     }}
                  >
                    {cityName}
                  </div>
                ))}
              </div>
            )}

            <div className="section section__temperature">
              <div className="icon">
                <h3>{`${weather.name}, ${weather.country}`}</h3>
                <img src={weather.iconURL} alt="weatherIcon" />
                <h3>{weather.description}</h3>
              </div>
              <div className="temperature">
                <h1>{`${weather.temp.toFixed()} °${
                  units === "metric" ? "C" : "F"
                }`}</h1>
              </div>
            </div>

            {/* bottom description */}
            <Descriptions weather={weather} units={units} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
