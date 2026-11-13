# Statement of need

Community-based participatory research (CBPR) brings community members, organizations, and researchers into every part of a study (Israel et al., 1998). It often asks a group to prioritize things together. Consensus methods like nominal group technique and Delphi rounds have long been used in health research, including to set priorities (Fink et al., 1984; Jones & Hunter, 1995; McMillan et al., 2016), and research partnerships use them too (Cary et al., 2023). Community members and study participants rank or weight items like candidate survey variables, research topics, or program priorities (Brush et al., 2022; Goold et al., 2018; Massi et al., 2023; Rideout et al., 2013; Salihu et al., 2015).

Dot voting is one of the simplest ways to do it. Everyone gets the same number of dots and places them on the items they would choose (Dalton, 2018). It has been used in community priority setting, for example alongside a World Café in a two-day HIV rehabilitation research forum (Restall et al., 2015). When these sessions happen in a classroom, a community workshop, or over Zoom, researchers usually reach for a general collaboration platform such as Miro, Mural, Mentimeter, Slido, Klaxoon, GroupMap, or dotstorming to run the vote.

Those platforms were built for business brainstorming and team retrospectives, which is also where dot voting is usually described (Dalton, 2018). That causes problems for research:

- **They ask for accounts.** In community settings, an account is a real barrier. It can also raise privacy and consent questions for people who are giving input but are not enrolled as research participants.
- **Free plans are limited.** Free tiers often cap how many people can join, or keep data export for paid plans. If you run a class session every few months or a single community workshop, a subscription is hard to justify and the free plan may not work.
- **The output is made for meetings.** You get a picture of the workshop, not a dataset. Getting from a board of votes to a table of items and vote counts for a statistical or machine learning pipeline usually means typing it in by hand. Priority-setting guidance asks for the opposite: report who took part, how priorities were decided, and the criteria behind them (Tong et al., 2019; Viergever et al., 2010). Users of nominal group technique are asked to name their scoring method and explain it mathematically (Thier & Mason, 2018). Consensus studies without a preregistered analysis plan leave room for selective reporting (Grant et al., 2018).
- **They don't fit the CBPR workflow.** A common CBPR step is to show a codebook or a list of candidate variables, such as survey items under consideration from a dataset like CHKS, and ask the community what matters most. The goal is structured, citable data about what people valued, not a workshop souvenir. When the community is Indigenous, how that data is collected and used is also a governance question (Carroll et al., 2020).

Free and open-source tools exist, like DotVote, IdeaBoardz, and dotstorm. They are also built and documented for team retrospectives. None of them combine a list of items you can swap in with an export made for research use.

## What mVote does

mVote is a no-account sticky-note voting tool made for research and CBPR settings.

- **You bring the items.** Facilitators load them from a simple CSV or JSON file, so any codebook, variable list, or set of priorities works without changing code.
- **Participants join without an account.** They open a link or scan a QR code and vote by placing dots, a familiar sticky-note activity.
- **Results come out as data.** The export has item identifiers, vote counts, and session details, ready for statistical analysis or feature selection. It turns the voting step of methods like nominal group technique and Delphi into reusable research data instead of a one-time meeting summary.
- **Sessions are scripted.** A small Python command line tool creates and configures each session from a file, so there is no admin screen to learn and a session can be repeated exactly.

mVote is for researchers, instructors, and community partners who run participatory prioritization and need something free, simple, and made for research.

## How it relates to the methods

mVote handles the voting step. It doesn't replace the rest of a method. In nominal group technique, people first write ideas on their own, share them in a round robin, and discuss them before anyone votes (Lee et al., 2024; McMillan et al., 2016). In Delphi, the group rates items over several rounds with feedback in between (Brush et al., 2022; Rideout et al., 2013). Those steps still happen in the room or in your study protocol.

A few choices are worth reporting with your results:

- **Votes are counts.** Each dot adds one to an item's total, and a person can put more than one dot on an item. That is closer to allocating points than to ranking or rating. Ranking, rating, and choice tasks can give different answers and put different demands on people (Del Grande & Kaczorowski, 2023; Ryan et al., 2001; Thier & Mason, 2018).
- **Counts are visible live.** Everyone sees the totals change as votes come in. Nominal group technique collects individual votes privately, partly so that a few voices don't dominate (MacPhail, 2001; Viergever et al., 2010). If that matters for your session, plan for it.
- **Who is in the room shapes the result.** Different groups often prioritize differently (Goold et al., 2018; Viergever et al., 2010). Online sessions can widen who takes part, but they can also change who shows up (Lee et al., 2024).

mVote is an early release. It is open source under the Apache License 2.0 (see [LICENSE](../LICENSE) and [NOTICE](../NOTICE)).

## References

Brush, B. L., Lee, S.-Y. D., Gabrysiak, A., Jensen, M., Wilson-Powers, E., Coombe, C. M., Chandanabhumma, P. P., Valerio, M., Israel, B. A., & Lachance, L. (2022). A CBPR-Enhanced Delphi Method: The Measurement Approaches to Partnership Success Case Study. *Health Education & Behavior*, *51*(2), 212–217. https://doi.org/10.1177/10901981221076400

Carroll, S. R., Garba, I., Figueroa-Rodríguez, O. L., Holbrook, J., Lovett, R., Materechera, S., Parsons, M., Raseroka, K., Rodriguez-Lonebear, D., Rowe, R., Sara, R., Walker, J. D., Anderson, J., & Hudson, M. (2020). The CARE Principles for Indigenous Data Governance. *Data Science Journal*, *19*. https://doi.org/10.5334/dsj-2020-043

Cary, M. A., Plamondon, K., Banner-Lukaris, D., Oelke, N., Sibley, K. M., Baxter, K., Vis-Dunbar, M., Hoens, A. M., Wick, U., Bigsby, S., Wuerstl, K., & Gainforth, H. (2023). Building consensus in research partnerships: a scoping review of consensus methods. *Evidence & Policy*, *19*(3), 485–511. https://doi.org/10.1332/174426421x16645354235140

Dalton, J. (2018). Dot Voting. In *Great Big Agile* (pp. 165–166). Apress. https://doi.org/10.1007/978-1-4842-4206-3_27

Del Grande, C., & Kaczorowski, J. (2023). Rating versus ranking in a Delphi survey: a randomized controlled trial. *Trials*, *24*(1). https://doi.org/10.1186/s13063-023-07442-6

Fink, A., Kosecoff, J., Chassin, M., & Brook, R. H. (1984). Consensus methods: characteristics and guidelines for use. *American Journal of Public Health*, *74*(9), 979–983. https://doi.org/10.2105/ajph.74.9.979

Goold, S. D., Myers, C. D., Danis, M., Abelson, J., Barnett, S., Calhoun, K., Campbell, E. G., LaHAHNN, L., Hammad, A., Rosenbaum, R. P., Kim, H. M., Salman, C., Szymecko, L., & Rowe, Z. E. (2018). Members of Minority and Underserved Communities Set Priorities for Health Research. *The Milbank Quarterly*, *96*(4), 675–705. https://doi.org/10.1111/1468-0009.12354

Grant, S., Booth, M., & Khodyakov, D. (2018). Lack of preregistered analysis plans allows unacceptable data mining for and selective reporting of consensus in Delphi studies. *Journal of Clinical Epidemiology*, *99*, 96–105. https://doi.org/10.1016/j.jclinepi.2018.03.007

Israel, B. A., Schulz, A. J., Parker, E. A., & Becker, A. B. (1998). Review of community-based research: Assessing partnership approaches to improve public health. *Annual Review of Public Health*, *19*(1), 173–202. https://doi.org/10.1146/annurev.publhealth.19.1.173

Jones, J., & Hunter, D. (1995). Qualitative Research: Consensus methods for medical and health services research. *BMJ*, *311*(7001), 376–380. https://doi.org/10.1136/bmj.311.7001.376

Lee, S. H., ten Cate, O., Gottlieb, M., Horsley, T., Shea, B., Fournier, K., Tran, C., Chan, T., Wood, T. J., & Humphrey-Murto, S. (2024). The use of virtual nominal groups in healthcare research: An extended scoping review. *PLOS ONE*, *19*(6), e0302437. https://doi.org/10.1371/journal.pone.0302437

MacPhail, A. (2001). Nominal Group Technique: A useful method for working with young people. *British Educational Research Journal*, *27*(2), 161–170. https://doi.org/10.1080/01411920120037117

Massi, L., Weatherall, L., Nielsen, C., Toombs, M., Fredericks, B., & Rae, K. M. (2023). “It’s research, our input can grow”: identifying health research priorities with Aboriginal and Torres Strait Islander communities—study protocol. *Research Involvement and Engagement*, *9*(1). https://doi.org/10.1186/s40900-023-00467-w

McMillan, S. S., King, M., & Tully, M. P. (2016). How to use the nominal group and Delphi techniques. *International Journal of Clinical Pharmacy*. https://doi.org/10.1007/s11096-016-0257-x

Restall, G. J., Carnochan, T. N., Roger, K. S., Sullivan, T. M., Etcheverry, E. J., & Roddy, P. (2015). Collaborative priority setting for human immunodeficiency virus rehabilitation research: A case report. *Canadian Journal of Occupational Therapy*, *83*(1), 7–13. https://doi.org/10.1177/0008417415577423

Rideout, C., Gil, R., Browne, R., Calhoon, C., Rey, M., Gourevitch, M., & Trinh-Shevrin, C. (2013). Using the Delphi and Snow Card Techniques to Build Consensus Among Diverse Community and Academic Stakeholders. *Progress in Community Health Partnerships: Research, Education, and Action*, *7*(3), 331–339. https://doi.org/10.1353/cpr.2013.0033

Ryan, M., Scott, D. A., Reeves, C., Bate, A., van Teijlingen, E. R., Russell, E. M., Napper, M., & Robb, C. M. (2001). Eliciting public preferences for healthcare: a systematic review of techniques. *Health Technology Assessment*, *5*(5). https://doi.org/10.3310/hta5050

Salihu, H. M., Salinas-Miranda, A. A., Wang, W., Turner, D., Berry, E. L., & Zoorob, R. (2015). Community Priority Index: Utility, Applicability and Validation for Priority Setting in Community-Based Participatory Research. *Journal of Public Health Research*, *4*(2). https://doi.org/10.4081/jphr.2015.443

Thier, M., & Mason, D. P. (2018). Breaking ranks? Differentiating nominal group technique scoring approaches for consensus and prioritization. *International Journal of Research & Method in Education*, *42*(4), 428–441. https://doi.org/10.1080/1743727x.2018.1533938

Tong, A., Synnot, A., Crowe, S., Hill, S., Matus, A., Scholes-Robertson, N., Oliver, S., Cowan, K., Nasser, M., Bhaumik, S., Gutman, T., Baumgart, A., & Craig, J. C. (2019). Reporting guideline for priority setting of health research (REPRISE). *BMC Medical Research Methodology*, *19*(1). https://doi.org/10.1186/s12874-019-0889-3

Viergever, R. F., Olifson, S., Ghaffar, A., & Terry, R. F. (2010). A checklist for health research priority setting: nine common themes of good practice. *Health Research Policy and Systems*, *8*(1). https://doi.org/10.1186/1478-4505-8-36
