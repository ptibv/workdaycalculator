# Workday api implementation

## Introduction
Application that allows you to define a configuration for specific usecases for the workday calculcator

# Startup actions
On startup the application will try to find all the json configuration files from the .config directory and try to generate a cache file for it.

# API documentation
## GetConfig
**[GET]** ``` /v1/:ref/config```

Fetches the configuration for a specific reference

**Response:**
```
{
    "status": "SUCCESS",
    "result": {
        "zone": "nl",
        "numberOfYears": 1,
        "workdays": [
            1,
            2,
            3,
            4,
            5
        ],
        "exclude": [],
        "excludeHolidays": []
    }
}
```

## PutConfig
**[PUT]** ```/v1/:ref/config```

Writes the configuration on runtime and generates the cache file

**Body (JSON):**
```
{
    "zone": "nl",
    "numberOfYears": 1,
    "workdays": [
        1,
        2,
        3,
        4,
        5
    ],
    "exclude": [],
    "excludeHolidays": []
}
```

**Response (JSON):**
```
{
    "status": "SUCCESS",
}
```

## GetHolidays
**[GET]** ```/v1/holidays/:zone```

Fetches a list of holidays for a specific zone which can be added to the configuration

**Response (JSON):**
```
{
    "status": "SUCCESS",
    "result": []
}
```

## IsWorkday
**[GET]** ```/v1/:ref/isWorkday/:date```

Checks if the given date is a workday

**Response (JSON):**
```
{
    "status": "SUCCESS",
    "result": true
}
```

## AddWorkdays
**[GET]** ```/v1/:ref/addWorkdays/:date/:nrOfDays```

Calculates the next workday based ont he given date and the number of days we should add

**Response (JSON):**
```
{
    "status": "SUCCESS",
    "result": "2023-12-27"
}
```

# Running in Docker
To run the application in Docker with persistence take the following steps:
```
$ docker build -t workdaysapi .
$ docker run -p 8181:8181 -v ${PWD}/cache:/cache -v ${PWD}/config:/config workdaysapi
```
