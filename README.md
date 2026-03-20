# ENGO 551 - Lab 4 (Continuation of Lab 3)

## Overview
This project is a continuation of Lab 3 and expands the original web mapping application for visualizing building permits in Calgary. In this lab, the application still allows users to select a start and end date and query building permit data from the Open Calgary GeoJSON API, but it is extended additional map for traffic incidents across Calgary. 

## Features of the Site

**Interactive Calgary Map:** Leaflet map of Calgary using OpenStreet map

**Date Range Search:** filters out permits by start and end date input

**Permit Markers:** permits are displayed as pink map markers

**Marker Popups:** clicking a permit marker shows issueddate, workclassgroup, contractorname, communityname, and originaladdress

**Marker Clustering:** dense results are clustered and a number shows to reduce clutter when zoomed out

**Overlapping Marker:** overlapping permits at the same location can spider out and the permits can be clicked on easily

**Refresh on New Search:** searching a new date range clears old results and displays the new set

**Traffic Incident Map:** visual and intractive map of traffic incidents across Calgary

## Project Structure

- **application.py** — Flask backend
- **index.html** — main page layout
- **main.js** — Leaflet which shows: map, search, markers, popups, and clustering
- **styles.css** — styling for layout, background, markers, and cluster appearance


## Instructions for Running the Site
Follow the instructions below to run the application

### 1. Install dependencies
Run this in the powershell:

pip install flask requests


### 2. Set the Open Calgary API credentials
Keep these private and only set them in your terminal 

In PowerShell, run:

$env:SODA_KEY_ID="YOUR_KEY_ID"
$env:SODA_KEY_SECRET="YOUR_KEY_SECRET"

## 3. Set the Mapbox Acess token 
Keep these private and only set them in your terminal (get these from your Mapbox Style)

In Powershell, run: 
$env:MAPBOX_TOKEN="YOUR_REAL_TOKEN"
$env:MAPBOX_STYLE="mapbox://styles/sneha31/cmmtjsrx5002e01sw6ick5njq"


### 4. Run the Flask application
Run this in the terminal:

python application.py


### 5. Open the site in your browser
Go to:


http://127.0.0.1:5000/


