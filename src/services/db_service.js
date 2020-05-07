import { db } from "../firebase";

// Collection names are assumed to be singular 'Project'
const GetAll = (pathToCollection, collectionName) => {
  let allDocs = [];
  let ref = db.collection(pathToCollection);
  return ref
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let d = doc.data();
        d.id = doc.id;
        allDocs.push(d);
      });
      return allDocs;
    })
    .catch((err) => {
      return {
        status: 500,
        msg: `Failed to get all ${collectionName}s. - ${err}`,
      };
    });
};

const GetById = (pathToCollection, id, collectionName) => {
  return db
    .collection(pathToCollection)
    .doc(id)
    .get()
    .then((doc) => {
      if (doc.exists) {
        let d = doc.data();
        d.id = doc.id;
        return { status: 200, msg: `${collectionName} Found`, payload: d };
      } else {
        return { status: 200, msg: `${collectionName} Not Found`, payload: {} };
      }
    })
    .catch((err) => {
      return {
        status: 500,
        msg: `Problem getting ${collectionName} - ${err}`,
        payload: {},
      };
    });
};

const Add = (pathToCollection, collectionName, newDoc) => {
  // Add a new document with a generated id.
  return db
    .collection(pathToCollection)
    .add(newDoc)
    .then((ref) => {
      if (ref.id !== undefined)
        return { status: 200, msg: `${collectionName} added` };
    })
    .catch((err) => {
      return { status: 500, msg: `Failed to add ${collectionName}. - ${err}` };
    });
};

const Update = (pathToCollection, collectionName, updatedDoc) => {
  return db
    .collection(pathToCollection)
    .doc(updatedDoc.id)
    .update(updatedDoc)
    .then((result) => {
      return { status: 200, msg: `${collectionName} updated.` };
    })
    .catch((err) => {
      return {
        status: 500,
        msg: `Failed to update ${collectionName} - ${err}`,
      };
    });
};

const Delete = (pathToCollection, id, collectionName) => {
  return db
    .collection(pathToCollection)
    .doc(id)
    .delete()
    .then(() => {
      return { status: 200, msg: `${collectionName} Deleted` };
    })
    .catch((err) => {
      return {
        status: 500,
        msg: `Failed to Delete ${collectionName}. - ${err}`,
      };
    });
};

export default {
  GetAll,
  GetById,
  Add,
  Update,
  Delete,
};
