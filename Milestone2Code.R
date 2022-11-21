library(tidyverse)
library(dplyr)
library(plotly)
library(leaflet)
library(leaflet.extras)
library(shiny)
library(ggplot2)
library(reshape2)
library(scales)

## Crime map
crimes <- read.csv("Crimes_With_Dates_Cleaned.csv")
crime.lite <- crimes %>% 
  select(Longitude, Latitude, Crime.Name3) %>% 
  filter(Longitude != 0 & Latitude!=0) %>% 
  mutate(Type = Crime.Name3) %>% 
  select(-Crime.Name3)

viz_map <- function(df) {
  df %>%
    leaflet() %>% 
    addTiles() %>% 
    setView(-77.2,39.14, 16) %>%
    addHeatmap(lng=~Longitude,lat=~Latitude,max=100,radius=25,blur=50) 
}

ui <- fluidPage(
  titlePanel("Crime Map"),
  fluidRow(
    column(
      8, 
      leafletOutput("viz_map")
    )
  )
)

server <- function(input, output, session) {
  crime.filtered <- reactive({
    crime.lite %>%
      mutate(selected = 1 * (type %in% input$Type))
  })
  
  output$viz_map <- renderLeaflet({
    viz_map(crime.lite)
  })
}

shinyApp(ui, server)


## Yearly change
data1 <- data.frame(crimes[,32],crimes[,8:10])

data2 <- data1 %>%
  group_by(Crime.Name1) %>%
  count(Year)

ggplot(data2) +
  geom_line(aes(Year, n, col = Crime.Name1))

fig <- plot_ly(data2, x = ~Year, y = ~n, type = 'scatter', mode = 'lines', color = ~Crime.Name1)
fig

## Crime type analysis
crime_1 <- crimes$`Crime Name1` 
crime_2 <- crimes$`Crime Name2` 
crime_3 <- crimes$`Crime Name3` 
Year <- crimes$Year
Place <- crimes$Place 
City <- crimes$City 
State <- crimes$State 
Agency <- crimes$Agency
crime_type = data.frame(crime_1, crime_2, crime_3, Year, Place, City, State, Agency)

## Crime time analysis
df <- melt(crimes ,  id.vars = 'hours', variable.name = 'counts')

ggplot(data = df,aes(x=hours)) +
  geom_area(aes(y = value, fill=counts),  alpha=0.6) +
  ggtitle("Total Crime and Victims counts by Hour") +
  xlab("Time (hour)") + 
  ylab("Total counts") +
  theme(legend.position="top") +
  scale_fill_discrete(labels=c("Crime Counts", "Victims")) +
  theme(legend.title=element_blank())