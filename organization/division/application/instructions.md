## System Introduction

In our system, we use two models to performance risk assessments. Model based approach is using Wells-Riley equation to estimate the potential risks of virus spreading and send P alerts to the public. A data driven approach is also to estimate the potential spreading based on previous work which derives past research and send R0 alerts to the public.

### P alert

The efficacy of social distance and ventilation effectiveness in preventing COVID-19 transmission Infection risk assessment is an useful tool in understanding the transmission dynamics of infectious diseases and in predicting the risks of diseases to the public. Well-Riley equation, a quantitative infection risk assessment model, can serve as tool to evaluate the effectiveness of infection control. The risk of airborne transmission of an infectious agent indoors is expressed by probability between 0 and 1. Risk assessment is essential not only to determine the probability of infecting and as a pre-requisite for common ventilation strategies.

####        Wells-Riley equation: $P = 1 - \exp \left(-\frac{qpt}{Q}\right)$

where $P$ the probability of infection after a certain exposure time $t$, $q$ is the quanta generation rate, $p$ is the rate of breathing, $Q$ is the room ventilation rate (with the outdoor air).

In our system, the building administrator can input the parameters of the indoor environment into the risk assessment system. After computing the probability of infection, the system will assist the building administrator to send a P alert to the public.

### R0 alert

Another fundamental concept in epidemic dynamic is the basic reproductive number, $R0$. It is the average number of secondary cases generated when one single infectious case is introduced into an population where everyone is susceptible. If $R0$ is greater 1, it implies that the airborne virus is spreading within the population and that cases are increasing, where $R0$ is less than 1, the disease is dying out. This can serve as a guideline on how intense the control policy is needed to control the spread.

In our system, the indoor CO2 data would be transmitted to our system in real time by sensors. If the input C02 value' $R0$ is greater than 0.5 , our system will automatically send a R0 alert to the public.
