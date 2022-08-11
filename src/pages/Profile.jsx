import React, { useContext, useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate, useParams } from "react-router-dom";

import {arrayRemove,arrayUnion,collection,doc,getDoc,onSnapshot,query,setDoc,where,updateDoc} from "firebase/firestore";
import { firestore, storage } from "../firebase/config";
import { AuthContext } from "../context/AuthContext";

import ProfilePostCard from "../components/ProfilePostCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Stories from "../components/Stories";
import { MdVerified as VerifiedIcon } from "react-icons/md";
import { MdAddAPhoto as EditProfileIcon } from "react-icons/md";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import NotFound from "../components/NotFound";
import Loading from "../components/Loading";
import { CgHello } from "react-icons/cg";


const intialState ={
    fullName : "",
}
const Profile = () => {
  const params = useParams();
  const { username } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState([]);
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const profilePic = useRef();
  const [noUser, setNoUser] = useState(true);
  const[biography,setBio]= useState("");
  const[categoryName,setCategory]= useState("");
  const [showModal, setShowModal] = React.useState(false);
  const [data,setData]= useState(intialState);
  const[fullName,setFullName]= useState("");
  // const{fullName}= data;
  //profileUser?.fullName
  
  
  const navigate = useNavigate();
  useEffect(() => {
    const getData = async () => {
      const userQuery = query(
        collection(firestore, "user"),
        where("username", "==", username)
      );
      onSnapshot(userQuery, (users) => {
        // console.log(users);
        if (!users.empty) {
          setPostIds(users?.docs[0]?.data()?.posts);
          setProfileUser({ id: users.docs[0].id, ...users?.docs[0]?.data() });
          setIsLoading(false);
          setNoUser(false);
          // console.log(noUser);
        }
        if (users.empty) {
          setProfileUser(null);
          // console.log(noUser);
          // console.log({ id: users.docs[0].id, ...users?.docs[0]?.data() });
          setIsLoading(false);
          setNoUser(true);
        }
      });
    };
    getData();
  }, [username]);

  useEffect(() => {
    const readIds = async (ids) => {
      const reads = ids.map((id) => getDoc(doc(firestore, "posts", `${id}`)));
      const result = await Promise.all(reads);
      return result?.map((doc) => ({ id: doc?.id, ...doc.data() }));
    };
    if (postIds?.length > 0) {
      const getData = async () => {
        try {
          const response = await readIds(postIds);
          if (response) {
            setPosts(response);
            // console.log(response);
          }
        } catch (error) {
          console.log(error);
        }
      };
      getData();
    }
  }, [postIds]);


  const UpdateDox = async () => 
    {
      await updateDoc(doc(firestore, "user", `${user?.uid}`), {
        biography: biography,
        categoryName:categoryName,
        fullName:fullName,
      })
      
    }
  const handleChange = (e) => {
    setData({...data,[e.target.fullName]: e.target.value});
  }     
  
  return (
    
    <div>
      <Header />
      <div className="mt-16 min-h-screen">
        {profileUser && (
          <main className="bg-gray-100 bg-opacity-25">                    
            <div className="lg:max-w-5xl lg:mx-auto mb-8">
              <header className="flex flex-wrap items-center p-4 md:py-8">
                <div className="md:w-3/12 md:ml-16">
                  {/* profile image */}
                  <div className="relative group w-20 h-20 md:w-40 md:h-40 object-cover overflow-hidden rounded-full">
                    {profileUser?.id === user?.uid && (
                      <div className="absolute cursor-pointer opacity-0 group-hover:opacity-100 duration-75 transition-all top-0 left-0 h-full w-full bg-black/70 flex items-center justify-center text-2xl md:text-4xl text-white aspect-square">
                        <EditProfileIcon
                          htmlFor="profile-image"
                          onClick={() => profilePic.current.click()}
                        />
                        <input
                          type="file"
                          name="profile-image"
                          className="hidden h-full w-full"
                          id="profile-image"
                          ref={profilePic}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            const storageRef = ref(
                              storage,
                              `users/${user?.uid}/profilePic.png`
                            );

                            const uploadTask = uploadBytesResumable(
                              storageRef,
                              file
                            );
                            uploadTask.on(
                              "state_changed",
                              (snap) => {
                                console.log(snap);
                              },
                              (err) => console.log(err),
                              () => {
                                getDownloadURL(uploadTask.snapshot.ref).then(
                                  async (downloadURL) => {
                                    console.log(
                                      "File available at",
                                      downloadURL
                                    );
                                    setDoc(
                                      doc(firestore, `user/${user?.uid}`),
                                      {
                                        photoURL: downloadURL,
                                      },
                                      { merge: true }
                                    );
                                  }
                                );
                              }
                            );
                          }}
                        />
                      </div>
                    )}
                    <LazyLoadImage
                      className="rounded-full h-full w-full border-2 border-pink-600 md:p-1 p-0.5"
                      src={
                        profileUser?.photoURL ||
                        "https://parkridgevet.com.au/wp-content/uploads/2020/11/Profile-300x300.png"
                      }
                      alt={profileUser?.fullName}
                    />
                  </div>
                </div>
                {/* profile meta */}
                <div className="w-8/12 md:w-7/12 ml-4">
                  <div className="md:flex md:flex-wrap md:items-center mb-4">
                    <h2 className="text-3xl inline-block font-light md:mr-2 mb-2 sm:mb-0">
                      {profileUser?.username}
                    </h2>
                    {/* badge */}
                    {profileUser?.isVerified && (
                      <span
                        className="inline-flex cursor-pointer text-blue-500 text-2xl mr-2"
                        title="A Verified User"
                      >
                        <VerifiedIcon />
                      </span>
                    )}
                    {user?.uid !== profileUser?.id && (
                      <button
                        className={`${
                          profileUser?.followedBy?.includes(user?.uid)
                            ? "bg-gray-400"
                            : "bg-blue-500"
                        } px-4 py-1 
                  text-white font-semibold text-sm rounded block text-center 
                  sm:inline-block`}
                        
                      >
                        {profileUser?.followedBy?.includes(user?.uid)
                          ? "Followed"
                          : "Follow"}
                      </button>
                    )}
                    {user?.uid === profileUser?.id && (
                      <button
                        className="border-gray-300 border-2 text-black  px-2 ml-5 text-center 
                        sm:inline-block rounded"
                        onClick={() =>  setShowModal(true)}
                      >
                      Edit profile
                      </button>
                    )}
                  </div>
                  <ul className="hidden md:flex space-x-8 mb-4">
                    <li>
                    <strong>22 </strong>
                      posts
                    </li>
                    <li>
                    <strong>50K </strong>
                      followers
                    </li>
                    <li>
                    <strong>100 </strong>
                      following
                    </li>
                    <li>
                  </li>
                  </ul>
                  <div className="hidden md:block">
                    <h1 className="font-semibold">{profileUser?.fullName}</h1>
                    <p className="font-normal text-sm text-gray-600">
                      {profileUser?.categoryName}
                    </p>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: `${profileUser?.biography
                          ?.replace("\n", "<br/>")
                          .replace("!\n", "<br/>")}`,
                      }}
                    ></p>
                    
                      <a
                        href={'#'}
                        target="_blank"
                        without
                        rel="noreferrer"
                        className="font-semibold text-blue-500"
                      >
                        {profileUser?.username}.com
                      </a>
                    
                  </div>
                </div>
                {/* user meta form small screens */}
                <div className="md:hidden text-sm my-2">
                  <h1 className="font-semibold">{profileUser?.fullName}</h1>
                  <span>{profileUser?.categoryName}</span>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: `${profileUser?.biography
                        ?.replace(" ", "<br/>")
                        ?.replace(" ", "<br/>")}`,
                    }}
                  ></p>
                </div>
                
              </header>
              {/* posts */}
              <div className="px-px md:px-3">
                {/* user following for mobile only */}
                <ul
                  className="flex md:hidden justify-around space-x-8 border-t 
                text-center p-2 text-gray-600 leading-snug text-sm"
                >
                  <li>
                    <strong>22 </strong>
                    posts
                  </li>
                  <li>
                  <strong>50K </strong>
                    followers
                  </li>
                  <li>
                  <strong>100 </strong>
                    following
                  </li>
                </ul>
                <div className="flex space-x-2 w-full mt-8 border-gray-200 border-b-2 rounded-sm overflow-x-scroll scrollbar-thin scrollbar-thumb-black">
                  <div class="inline-flex ml-20 mt-16">
                    <div class="flex-1 text-center px-4 py-2 m-2">
                      <div
                        class="relative shadow-xl mx-auto h-20 w-20 -my-12 border-white rounded-full overflow-hidden border-4 cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                      >
                        <img
                          class="object-cover w-full h-full"
                          src="https://images.unsplash.com/photo-1502164980785-f8aa41d53611?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"/>
                      </div>
                      <h1 class="pt-16 text-base font-semibold text-gray-900">Fun</h1>
                    </div>

                    <div class="flex-1 text-center px-4 py-2 m-2">
                      <div
                        class="relative shadow-xl mx-auto h-20 w-20 -my-12 border-white rounded-full overflow-hidden border-4 cursor-pointer hover:scale-110 transition transform duration-200 ease-out" >
                        <img
                          class="object-cover w-full h-full"
                          src="https://images.unsplash.com/photo-1456415333674-42b11b9f5b7b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80" />
                      </div>
                      <h1 class="pt-16 text-base font-semibold text-gray-900">Travel</h1>
                    </div>

                    <div class="flex-1 text-center px-4 py-2 m-2">
                      <div
                        class="relative shadow-xl mx-auto h-20 w-20 -my-12 border-white rounded-full overflow-hidden border-4 cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                      >
                        <img
                          class="object-cover w-full h-full"
                          src="https://images.unsplash.com/photo-1494972308805-463bc619d34e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1052&q=80"/>
                      </div>
                      <h1 class="pt-16 text-base font-semibold text-gray-900">Food</h1>
                    </div>

                    <div class="flex-1 text-center px-4 py-2 m-2">
                      <div
                        class="relative shadow-xl mx-auto h-20 w-20 -my-12 border-white rounded-full overflow-hidden border-4 cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                      >
                        <img
                          class="object-cover w-full h-full"
                          src="https://images.unsplash.com/photo-1516834474-48c0abc2a902?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1053&q=80"/>
                      </div>
                      <h1 class="pt-16 text-base font-semibold text-gray-900">Sketch</h1>
                    </div>

                    <div class="flex-1 text-center px-4 py-2 m-2">
                      <div
                        class="relative shadow-xl mx-auto h-20 w-20 -my-12 border-white rounded-full overflow-hidden border-4 cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                      >
                        <img
                          class="object-cover w-full h-full"
                          src="https://images.unsplash.com/photo-1444021465936-c6ca81d39b84?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"/>
                      </div>
                      <h1 class="pt-16 text-base font-semibold text-gray-900">My Work</h1>
                    </div>
                   
                  </div>
                </div>
                {posts?.length === 0 && (
                  <div className="flex items-center justify-center h-screen">
                    <div className="text-center">No posts yet</div>
                  </div>
                )}
                <motion.div
                  layout
                  className="grid grid-cols-3 md:gap-8 gap-1 md:p-2 p-1"
                >
                  {posts?.reverse().map((post, index) => (
                    <ProfilePostCard key={index} post={post} />
                  ))}
                </motion.div>
              </div>
             
            </div>
            {showModal ? (
                            <>
                              <div
                                className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                              >
                                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                                  {/*content*/}
                                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                                   {/* <div className="relative p-3 md:flex">
                                      <label htmlFor="" className="mr-3 mt-2">Name</label>
                                      <input
                                        type="text"
                                        placeholder="your full Name"
                                        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded"
                                        onChange={handleChange}
                                        value={fullName}
                                      />                                     
                                    </div> */}
                                    <div className="relative p-3 md:flex">
                                      <label htmlFor="">Username</label>
                                      <input
                                        type="text"
                                        placeholder="your biography"
                                        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded"
                                        onChange={({ target }) => setFullName(target.value)}
                                        value={fullName}
                                      />                                     
                                    </div> 
                                    <div className="relative p-3 md:flex">
                                      <label htmlFor="" className="mr-3 mt-2">Category</label>
                                      <input
                                        type="text"
                                        placeholder="your categry"
                                        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded mb-2"
                                        onChange={({ target }) => setCategory(target.value)}
                                        value={categoryName}
                                      />
                                    </div>
                                    <div className="relative p-3 md:flex">
                                      <label htmlFor=""className="mr-3 mt-2">Biography</label>
                                      <textarea 
                                        placeholder="your biography"
                                        className="text-sm text-gray-base w-full mr-3 py-5 px-4 h-2 border border-gray-primary rounded"
                                        onChange={({ target }) => setBio(target.value)}
                                        value={biography} cols="30" rows="10">
                                        </textarea>                                     
                                    </div>
                                    {/*footer*/}
                                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                                      <button
                                        className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="button"
                                        onClick={() => setShowModal(false) }
                                      >
                                        Close
                                      </button>
                                      <button
                                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                                        type="submit" 
                                        onClick={UpdateDox}
                                         >
                                        Update
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                            </>
                       ) : null} 
          </main>
        )}
        {isLoading && (
          <>
            <Loading />
          </>
        )}
        {noUser && (
          <div className="py-56 w-full flex items-center justify-center p-3">
            <NotFound />
          </div>
        )}
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Profile;
