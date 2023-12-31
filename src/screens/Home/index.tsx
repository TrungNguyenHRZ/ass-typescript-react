import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./index.css";
import Card from "./Card";
import Round from "./Round";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import music from "../Assets/sound/home.mp3";
import axiosInstance from "../../service";

interface StarShipData {
  name: string;
  max_atmosphering_speed: string;
  cost_in_credits: string;
  passengers: string;
  films: string[];
}

const Home = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();
  const username = location.state?.username || "User";
  const [clickedItems, setClickedItems] = useState<number[]>([]);
  const [userScore, setUserScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [createCount, setCreateCount] = useState<number>(0);
  const [starShipData, setStarShipData] = useState<
    [StarShipData | null, StarShipData | null]
  >([null, null]);
  const [usedIds, setUsedIds] = useState<number[]>([]);

  const ids = [
    2, 3, 5, 9, 10, 11, 12, 13, 17, 22, 27, 28, 31, 32, 39, 40, 43, 59, 66, 68,
  ];

  useEffect(() => {
    getRandomStarShips();
  }, []);

  const getRandomStarShips = async () => {
    try {
      let randomId1 = getRandomUniqueId();
      let randomId2 = getRandomUniqueId();
      const starShipResponse1 = await axiosInstance.get(`/${randomId1}`);
      const starShipResponse2 = await axiosInstance.get(`/${randomId2}`);
      setStarShipData([starShipResponse1.data, starShipResponse2.data]);
      setUsedIds([...usedIds, randomId1, randomId2]);
      compareAndIncrementScores();
    } catch (error) {
      console.error("Error fetching random starships:", error);
    }
  };

  const getRandomUniqueId = () => {
    let randomId = ids[Math.floor(Math.random() * ids.length)];
    while (usedIds.includes(randomId)) {
      randomId = ids[Math.floor(Math.random() * ids.length)];
    }
    return randomId;
  };

  const convertToNumberOrNegativeOne = (value: string) => {
    if (value === "unknown" || value === "n/a") {
      return -1;
    }
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? -1 : parsedValue;
  };

  const compareAndIncrementScores = () => {
    if (starShipData[0] && starShipData[1]) {
      let newUserScore = userScore;
      let newComputerScore = computerScore;

      const userSpeed = convertToNumberOrNegativeOne(
        starShipData[0].max_atmosphering_speed
      );
      const computerSpeed = convertToNumberOrNegativeOne(
        starShipData[1].max_atmosphering_speed
      );

      if (userSpeed > computerSpeed) {
        newUserScore = newUserScore + 1;
      } else if (userSpeed < computerSpeed) {
        newComputerScore = newComputerScore + 1;
      }

      const userCost = convertToNumberOrNegativeOne(
        starShipData[0].cost_in_credits
      );
      const computerCost = convertToNumberOrNegativeOne(
        starShipData[1].cost_in_credits
      );
      if (userCost !== -1 && computerCost !== -1) {
        if (userCost > computerCost) {
          newUserScore = newUserScore + 1;
        } else if (userCost < computerCost) {
          newComputerScore = newComputerScore + 1;
        }
      }

      const userPassengers = convertToNumberOrNegativeOne(
        starShipData[0].passengers
      );
      const computerPassengers = convertToNumberOrNegativeOne(
        starShipData[1].passengers
      );
      if (userPassengers !== -1 && computerPassengers !== -1) {
        if (userPassengers > computerPassengers) {
          newUserScore = newUserScore + 1;
        } else if (userPassengers < computerPassengers) {
          newComputerScore = newComputerScore + 1;
        }
      }

      setUserScore(newUserScore);
      setComputerScore(newComputerScore);
    }
  };

  const handleCardUserClick = () => {
    console.log("Clicked!");
    compareAndIncrementScores();
  };

  const handlePlayMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsMusicPlaying(true);
      } else {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  return (
    <div className="my-home-container">
      <audio ref={audioRef} loop autoPlay>
        <source src={music} type="audio/mp3" />
      </audio>
      <button onClick={handlePlayMusic}>
        {isMusicPlaying ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>
      <div className="my-logo-class">
        <img
          className="my-logo"
          src="https://i.pinimg.com/originals/b6/af/5a/b6af5aeff0ee43a4253fc70c167bb6db.png"
          alt=""
        />
      </div>
      <div className="my-info-score">
        <div className="my-user">
          <div className="my-name my-user-name">
            <h3>{username}</h3>
          </div>
          <div className="my-score my-user-score">
            <h4>{userScore}</h4>
          </div>
        </div>
        <div className="my-computer">
          <div className="my-name my-computer-name">
            <h3>Computer</h3>
          </div>
          <div className="my-score my-computer-score">
            <h4>{computerScore}</h4>
          </div>
        </div>
      </div>
      <Round count={createCount} />
      <div className="my-card-container">
        <Card
          type="user"
          onClick={handleCardUserClick}
          clickable={true}
          clickedItems={clickedItems}
          onClickItem={(id) => setClickedItems((prev) => [...prev, id])}
          starShipData={starShipData[0]}
        />
        <Card
          type="computer"
          clickable={false}
          clickedItems={clickedItems}
          starShipData={starShipData[1]}
        />
      </div>
    </div>
  );
};

export default Home;
