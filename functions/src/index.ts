import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const updateUserEmailInFirestore = functions.pubsub
  .schedule("every 1 minute")
  .onRun(async (context) => {
    console.log("Starting email update process.");
    try {
      // Retrieve all Firebase users
      const userRecords = await admin.auth().listUsers();

      // Iterate through each user
      for (const userRecord of userRecords.users) {
        const { uid, email } = userRecord;

        // Get the user's document in Firestore
        const userDocRef = admin.firestore().collection("users").doc(uid);
        const userDocSnapshot = await userDocRef.get();

        // Check if the user document exists
        if (userDocSnapshot.exists) {
          const userData = userDocSnapshot.data();
          const userEmailInFirestore = userData?.email;

          // Check if the email in Firestore matches the user's email
          if (userEmailInFirestore !== email) {
            // Update the email field in Firestore with the user's email
            await userDocRef.update({ email });
            console.log(`Email updated in Firestore for user: ${uid}`);
          } else {
            console.log(
              `Email in Firestore is already up to date for user: ${uid}`
            );
          }
        } else {
          console.log(
            `User document does not exist in Firestore for user: ${uid}`
          );
        }
      }

      console.log("Email update process completed successfully.");
    } catch (error) {
      console.error("Error updating emails in Firestore:", error);
    }
  });

export const testing = functions.auth.user().onCreate(async (user) => {
  console.log("User created:", user.uid);
});
