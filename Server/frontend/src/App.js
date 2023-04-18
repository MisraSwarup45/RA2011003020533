import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [trainsNames, setTrainsNames] = useState([]);



  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/updatedtrains');
        const trainsNames = await response.json();
        setTrainsNames(trainsNames);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTrains();
  }, []);


  return (
    <div className="container">
      {
        trainsNames.map((train, index) => {
          return (
            <div key={index} className="train-card">
              <h2 className="train-name">{train.trainName}</h2>
              <table className="train-table">
                <tbody>
                  <tr>
                    <td className="table-label">Train Number:</td>
                    <td className="table-value">{train.trainNumber}</td>
                  </tr>
                  <tr>
                    <td className="table-label">Departure Time:</td>
                    <td className="table-value">
                      {train.departureTime.Hours}:{train.departureTime.Minutes}:{train.departureTime.Seconds}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Seats Available:</td>
                    <td className="table-value">
                      Sleeper: {train.seatsAvailable.sleeper} <br></br> AC: {train.seatsAvailable.AC}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Price:</td>
                    <td className="table-value">
                      Sleeper: {train.price.sleeper} <br></br> AC: {train.price.AC}
                    </td>
                  </tr>
                  <tr>
                    <td className="table-label">Delayed By:</td>
                    <td className="table-value">{train.delayedBy} minutes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })
      }
    </div>
  );
}

export default App;