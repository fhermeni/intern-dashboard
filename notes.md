# Notification des progres des stages en node.js


#Database
students
#num, passwd, email, parcours

parcours
#name, responsable_email

responsable
#name, passwd, parcours_name

applications
#login,#id, date,title, description, status(pending, denied, accepted), interviews


#Etudiant
#Fournit 
# numero étudiant
-> retourne password

#Notification postulation
#date + entreprise + nom du sujet

#Notification entretien
#sur la liste des postulation en cours, click sur entretien

#Actions:
refus,
entretien, (plusieurs)
cloture
acceptation


#Si notification refus, clique refus

#Si accepté, clique accepté

-> demande au tuteur

