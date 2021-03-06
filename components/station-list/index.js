import React, { useEffect, useState } from 'react'
import { array } from 'prop-types'
import getDistance from 'geolib/es/getDistance'
import styled from '@emotion/styled'
import Link from 'next/link'

import Header from '../../components/header'
import Subheader from '../../components/subheader'

const StationList = ({ stationList = [] }) => {
  const [closestStation, setClosestStation] = useState({})
  const [recentStations, setRecentStations] = useState(null)

  const handleGeolocationSuccess = ({ latitude, longitude }) => {
    let currentClosestStation = stationList[0]
    if (!currentClosestStation.gtfs_latitude) return
    let closestDistance = getDistance({ latitude: parseFloat(currentClosestStation.gtfs_latitude), longitude: parseFloat(currentClosestStation.gtfs_longitude) }, { latitude, longitude })

    for (let i = 1; i < stationList.length; i++) {
      const newDistance = getDistance({ latitude: parseFloat(stationList[i].gtfs_latitude), longitude: parseFloat(stationList[i].gtfs_longitude) }, { latitude, longitude })
      if (newDistance < closestDistance) {
        closestDistance = newDistance
        currentClosestStation = stationList[i]
      }
    }
    setClosestStation(currentClosestStation)
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentRecentStations = window.localStorage.getItem('recentStations') || null
      if (currentRecentStations) {
        setRecentStations(currentRecentStations.split(','))
      }
    }

    const getCurrentPosition = () => {
      if (typeof window !== 'undefined') {
        window.navigator.geolocation.getCurrentPosition(
          (position) => handleGeolocationSuccess(position.coords),
          (err) => err,
          { timeout: 15000, maximumAge: 60000 }
        )
      }
    }

    if (!closestStation && stationList.length && 'geolocation' in window.navigator) {
      getCurrentPosition()
    }

    const interval = setInterval(() => getCurrentPosition(), 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='StationListContainer'>
      <Header>
        Pick a BART Station
      </Header>
      {closestStation.name &&
        <TopStationListContainer>
          <Subheader>
            Closest Station
          </Subheader>
          <Link href={`/station?key=${closestStation.abbr}`}>
            <StyledA><StationLink>{closestStation.name}</StationLink></StyledA>
          </Link>
        </TopStationListContainer>
      }
      {recentStations &&
        <TopStationListContainer>
          <Subheader>
            Recent Stations
          </Subheader>
          {recentStations.length &&
            recentStations.map((station, index) => {
              const stationInfoArray = station.split(':')
              return (
                <Link href={`/station?key=${stationInfoArray[0]}`} key={index}>
                  <StyledA><StationLink index={index}><StyledText>{stationInfoArray[1]}</StyledText></StationLink></StyledA>
                </Link>
              )
            }
            )
          }
        </TopStationListContainer>
      }
      {(closestStation || recentStations) &&
        <Subheader>
          All Stations
        </Subheader>
      }
      <div>
        {stationList.length
          ? stationList.map((station, index) => (
            <Link href={`/station?key=${station.abbr}`} key={index}>
              <StyledA><StationLink index={index}><StyledText>{station.name}</StyledText></StationLink></StyledA>
            </Link>
          ))
          : <div>Loading...</div>
        }
      </div>
    </div>
  )
}

StationList.propTypes = {
  stationList: array
}

const TopStationListContainer = styled.div`
  padding-bottom: 2rem;
`

const StyledA = styled.a`
  text-decoration: none;
`

const StationLink = styled.div`
  background-color: ${({ index }) => index % 2 === 0 ? '#666' : '#888'};
  border: none;
  color: #ddd;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: 300;
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
  padding: 1rem 0;
  text-align: left;
  text-transform: uppercase;
  width: 100%;
`

const StyledText = styled.div`
  margin-left: 0.5rem;
`

export default StationList
