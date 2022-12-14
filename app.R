library(leaflet)
library(leaflet.extras)
library(dplyr)
library(shiny)
library(plotly)
library(reshape2)
library(tidyverse)
library(anytime)
library(lubridate)
library(scales)
crime <- read.csv("Crimes_With_Dates_Cleaned.csv")
crime.lite <- crime %>% 
    select(Longitude, Latitude, Crime.Name3) %>% 
    filter(Longitude != 0 & Latitude != 0) %>% 
    mutate(Type = Crime.Name3) %>% 
    select(-Crime.Name3)

crime.lite2 <- crime %>% 
  select(Crime.Name1, Crime.Name2, Crime.Name3, Year, City, State, Agency) %>%
  na.omit() %>%
  filter(Agency != '' & Agency != 'P' & Crime.Name1 != '' & Agency != 'OTHR' & Agency != 'MCSO') 

crime.lite4 <- crime %>%
  select(Year, Crime.Name1, Agency) %>% 
  filter(Crime.Name1 != '') %>%
  filter(Agency != '' & Agency != 'P' & Agency != 'OTHR' & Agency != 'MCSO')

crime.lite5 <- crime %>%
  select(X, Dispatch.Date...Time, Victims, Agency) %>% 
  filter(Agency != '' & Agency != 'P' & Agency != 'OTHR' & Agency != 'MCSO') %>% 
  mutate(Dispatch.Date...Time = strptime(Dispatch.Date...Time, format ="%m/%d/%Y %I:%M:%S %p") ) %>% 
  mutate(hours = format(as.POSIXct(Dispatch.Date...Time), format = "%H")) %>%
  filter(hours != 'NA') 

viz_map <- function(df) {
  df %>%
    leaflet() %>% 
    addTiles() %>% 
    setView(-77.2,39.14, 16) %>%
    addHeatmap(lng=~Longitude,lat=~Latitude,max=100,radius=25,blur=50) %>%
    addTiles() %>%
    addPopups(c(-77.2337418,-77.14707643307663, -77.153380, -77.0104707, -77.19550564652697), c(39.1498108, 39.08930138041507, 39.084010, 38.9816842, 39.14018011302936), c("MCPD","MCMF", "RCPD", "TPPD", "GPD"),
              options = popupOptions(closeButton = F))
    
}

lineplot <- function(df) {
  df %>%
    group_by(Crime.Name1) %>%
    count(Year)%>%
    plot_ly(x = ~Year, y = ~n, type = 'scatter', mode = 'lines', color = ~Crime.Name1) %>%
    layout(legend = list(x = 100, y = 0.5))
}

barplot <- function(df) {
  df %>%
    ggplot() +
    geom_bar(aes(Agency, fill = Crime.Name1), position = position_dodge()) +
    facet_wrap(~ Year) +
    scale_color_discrete(labels = label_wrap(15)) +
    xlab("Crime Type") + 
    ylab("Counts") +
    theme(legend.position="top") +
    theme(axis.text.x = element_text(angle = 90, vjust = 0.5, hjust=1),   
          legend.text=element_text(size=8))
}

stackplot <- function(df) {
  hour_count <- dplyr::count(df,hours)
  colnames(hour_count) <- c("hours", "crime_counts")
  victim_count <- df %>% 
    group_by(hours) %>% 
    summarise(victims = sum(Victims))
  df.merge <- merge(hour_count, victim_count, by="hours")
  melt(df.merge, id.vars = 'hours', variable.name = 'counts') %>%
    mutate(hours = as.numeric(hours)) %>%
    ggplot(aes(x=hours)) +
    geom_area(aes(y = value, fill=counts),  alpha=0.6) +
    ggtitle("Total Crime and Victims counts by Hour") +
    xlab("Time (hour)") + 
    ylab("Total counts") +
    theme(legend.position="top") +
    scale_fill_discrete(labels=c("Crime Counts", "Victims")) +
    theme(legend.title=element_blank())
}
ui <- fluidPage(
    fluidRow(
      column(
        12, 
        "Crime Map",
        leafletOutput("viz_map", height = 500),
        br(),
        selectInput("Agency","Agency", choices = unique(crime.lite4$Agency), multiple = FALSE),
        fluidRow(
          column(6, "Yearly Change", plotlyOutput("lineplot")),
          column(6, "Hourly Change", plotOutput("stackplot"))
        ),
        br(),
        "Crime Type",
        plotOutput("barplot", height = 600)
      )
    ),
)

server <- function(input, output, session) {
    crime.filtered <- reactive({
      crime.lite4 %>%
        filter(
          Agency %in% input$Agency
        )
    })
    crime.filtered.2 <- reactive({
      crime.lite5 %>%
        filter(Agency %in% input$Agency)
    })
    output$viz_map <- renderLeaflet({
        viz_map(crime.lite)
    })
    output$lineplot <- renderPlotly({
      lineplot(crime.filtered())
    })
    output$barplot <- renderPlot({
      barplot(crime.lite2)
    })
    output$stackplot <- renderPlot({
      stackplot(crime.filtered.2())
    })
}

shinyApp(ui, server)
