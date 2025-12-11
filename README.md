# AISanta
A new project to use for our internal gaming for secret santa


# Design 

Problem :
 we are group of friends playing a gane called secret santa . since we are remote we cannot pick names from the bowl and choose who I ll be the secre tsanta for . each player will have a secret santa assigned since evryone names are present in the bowl.

solution :

I was thinking of creating a web application where user can login with a email id and nameCode. once they login they should see other nameCode (person who the user should send the gift too) poping up on their screen .   make sure to send this response nameCode (which will be randomly assigned by the app  to the user email also since we have the email id with us while logging in .



rules :
NameCodes Tab: 
 are the names of the players playing this game these are unique and anyone can  add the names to that page and everyone can see the NameCodes  when they click on the tab.
be default add Admin and  also show up a button called "Add Player" on right top of page  the action of that button is  when cliked it should allow the Admin to add a name: textbox  (uniqueName need to be added) and save botton next to it when clicked should add it to the NameCodes and save it. and reflect in the NamCodes page.  

Landing Page :  when user login with NameCode and emailid  ( makeSure the nameCode is present in the memory if not he/she is not a proper user dont allow inside the applicaton. Landing Page display the nameCode that is assigned for the current user (this should be same everytime no changing in random )
make sure the nameCode of user and  that is picked for this user after login  from the NameCodes list is not same (same person cannot gift him/her)

Login Page : Show AI_Santa on the top of the page and simpe login with NameCode: text box and emailid textbox and login button


Game logic :

    for admin landing page is empty no name will be displayed. but just it ll show him/her a NamesCode tab ..by clicking on that tab will show the names that are added or they can add the new nameCodes by clking on the Add Player 

once the admin saves the NameCode .the name should be stored in the database. when any other user login they clicking on the nameCodes will show all the names that are added soo far. 

and our logic will make sure it ll pick a random name from that list and assign that to the user who logs in and send email for the email id with which they logd in.  and saves this entire mapping in memory so that when next time the user log in ..it ll show the same namecode that was generared for the 1st time even on the nth tine login .

use react for fronend and  use css and html wherever needed . if any backend apis use node js and wire everything. I want a full end to end running web application 

