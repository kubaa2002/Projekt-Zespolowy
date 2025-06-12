import  { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/authProvider';
import axios from 'axios';
import { useNavigate } from '@tanstack/react-router';

const UserTag = ({ post }) => {
  const { userName: authorName, createdDateTime, authorId, id } = post;
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleted, setIsDeleted] = useState(post.isDeleted || false);
  const menuRef = useRef();
  const { user, token,follow,setFollow } = useAuth();
  const navigate = useNavigate();

  const isPostOwner = authorId === user.id;
  const formattedDate = new Date(createdDateTime).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleDeletePost = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/Delete/${id}`,
        {},
        getAuthConfig()
      );
      if (response.status === 200) {
        setIsDeleted(true); 
        setShowMenu(false);
      }
    } catch (err) {
      console.error('Błąd podczas usuwania posta:', err.response?.data?.error || err.message);
    }
  };

  const handleRestorePost = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/UndoDelete/${id}`,
        {},
        getAuthConfig()
      );
     
        setIsDeleted(false);
        setShowMenu(false);
     
    } catch (err) {
      console.error('Błąd podczas przywracania posta:', err.response?.data?.error || err.message);
    }
  };

  const handleFollow = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/follow/${authorId}`,
      {},
      getAuthConfig()
    );
    if (response.status === 201) {
      console.log(`Zaobserwowano użytkownika: ${authorId}`);
      setFollow(p => [...p, {
        "id": authorId,
        "userName": authorName
    }])

      setShowMenu(false);
  
    }
  } catch (err) {
    console.error('Błąd podczas obserwowania użytkownika:', err.response?.data?.error || err.message);
  }
};

  const handleUnfollow = async () => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_URL}/user/unfollow/${authorId}`,
      getAuthConfig()
    );
    if (response.status === 200) {
      console.log(`Przestano obserwować użytkownika: ${authorId}`);
      setShowMenu(false);
      setFollow(p => p.filter(author => author.id !== authorId));
   

     
    }
  } catch (err) {
    console.error('Błąd podczas przestania obserwowania użytkownika:', err.response?.data?.error || err.message);
  }
};



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="post-header" style={{ backgroundColor: isDeleted ? '#ffcccc' : 'transparent' }}>
     
      
        {!isDeleted ? (<div className="post-author" onClick={() => navigate({to: `/users/${authorId}`})} >
          <div className="author-avatar" />
        <div>
          <div className="author-name">{authorName}</div>
          <div className="post-date">{formattedDate}</div>
        </div></div>
        ) : (<div></div>)}
      
      <div className="menu-container" ref={menuRef}>
        <button className="dots-button" onClick={() => setShowMenu(!showMenu)}>
          <svg width="24" height="24" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20.7812 28.4375C20.7812 29.3077 20.4355 30.1423 19.8202 30.7577C19.2048 31.373 18.3702 31.7188 17.5 31.7188C16.6298 31.7188 15.7952 31.373 15.1798 30.7577C14.5645 30.1423 14.2188 29.3077 14.2188 28.4375C14.2188 27.5673 14.5645 26.7327 15.1798 26.1173C15.7952 25.502 16.6298 25.1562 17.5 25.1562C18.3702 25.1562 19.2048 25.502 19.8202 26.1173C20.4355 26.7327 20.7812 27.5673 20.7812 28.4375ZM20.7812 17.5C20.7812 18.3702 20.4355 19.2048 19.8202 19.8202C19.2048 20.4355 18.3702 20.7812 17.5 20.7812C16.6298 20.7812 15.7952 20.4355 15.1798 19.8202C14.5645 19.2048 14.2188 18.3702 14.2188 17.5C14.2188 16.6298 14.5645 15.7952 15.1798 15.1798C15.7952 14.5645 16.6298 14.2188 17.5 14.2188C18.3702 14.2188 19.2048 14.5645 19.8202 15.1798C20.4355 15.7952 20.7812 16.6298 20.7812 17.5ZM20.7812 6.5625C20.7812 7.43274 20.4355 8.26734 19.8202 8.88269C19.2048 9.49805 18.3702 9.84375 17.5 9.84375C16.6298 9.84375 15.7952 9.49805 15.1798 8.88269C14.5645 8.26734 14.2188 7.43274 14.2188 6.5625C14.2188 5.69226 14.5645 4.85766 15.1798 4.24231C15.7952 3.62695 16.6298 3.28125 17.5 3.28125C18.3702 3.28125 19.2048 3.62695 19.8202 4.24231C20.4355 4.85766 20.7812 5.69226 20.7812 6.5625Z"
              fill="black"
            />
          </svg>
        </button>
        {showMenu && (
          <div className="ggg">
            {isPostOwner ? (
              isDeleted ? (
                <button onClick={handleRestorePost}>
                  Przywróć post
                </button>
              ) : (
                <button onClick={handleDeletePost}>
                  Usuń post
                </button>
              )
            ) : (
              <>
               {follow.some(p => p.id === authorId) ? (<button onClick={handleUnfollow}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_796_12856)">
                      <path
                        d="M4.49963 6C5.09637 6 5.66867 5.76295 6.09062 5.34099C6.51258 4.91903 6.74963 4.34674 6.74963 3.75C6.74963 3.15326 6.51258 2.58097 6.09062 2.15901C5.66867 1.73705 5.09637 1.5 4.49963 1.5C3.9029 1.5 3.3306 1.73705 2.90864 2.15901C2.48669 2.58097 2.24963 3.15326 2.24963 3.75C2.24963 4.34674 2.48669 4.91903 2.90864 5.34099C3.3306 5.76295 3.9029 6 4.49963 6ZM5.99963 3.75C5.99963 4.14782 5.8416 4.52936 5.56029 4.81066C5.27899 5.09196 4.89746 5.25 4.49963 5.25C4.10181 5.25 3.72028 5.09196 3.43897 4.81066C3.15767 4.52936 2.99963 4.14782 2.99963 3.75C2.99963 3.35218 3.15767 2.97064 3.43897 2.68934C3.72028 2.40804 4.10181 2.25 4.49963 2.25C4.89746 2.25 5.27899 2.40804 5.56029 2.68934C5.8416 2.97064 5.99963 3.35218 5.99963 3.75ZM8.99963 9.75C8.99963 10.5 8.24963 10.5 8.24963 10.5H0.749634C0.749634 10.5 -0.000366211 10.5 -0.000366211 9.75C-0.000366211 9 0.749634 6.75 4.49963 6.75C8.24963 6.75 8.99963 9 8.99963 9.75ZM8.24963 9.747C8.24888 9.5625 8.13413 9.0075 7.62563 8.499C7.13663 8.01 6.21638 7.5 4.49963 7.5C2.78213 7.5 1.86263 8.01 1.37363 8.499C0.865134 9.0075 0.751134 9.5625 0.749634 9.747H8.24963Z"
                        fill="#212529"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.1246 3.75C10.2241 3.75 10.3195 3.78951 10.3898 3.85984C10.4601 3.93016 10.4996 4.02554 10.4996 4.125V5.25H11.6246C11.7241 5.25 11.8195 5.28951 11.8898 5.35984C11.9601 5.43016 11.9996 5.52554 11.9996 5.625C11.9996 5.72446 11.9601 5.81984 11.8898 5.89016C11.8195 5.96049 11.7241 6 11.6246 6H10.4996V7.125C10.4996 7.22446 10.4601 7.31984 10.3898 7.39017C10.3195 7.46049 10.2241 7.5 10.1246 7.5C10.0252 7.5 9.92979 7.46049 9.85947 7.39017C9.78914 7.31984 9.74963 7.22446 9.74963 7.125V6H8.62463C8.52518 6 8.42979 5.96049 8.35947 5.89016C8.28914 5.81984 8.24963 5.72446 8.24963 5.625C8.24963 5.52554 8.28914 5.43016 8.35947 5.35984C8.42979 5.28951 8.52518 5.25 8.62463 5.25H9.74963V4.125C9.74963 4.02554 9.78914 3.93016 9.85947 3.85984C9.92979 3.78951 10.0252 3.75 10.1246 3.75Z"
                        fill="#212529"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_796_12856">
                        <rect width="12" height="12" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  Przestań obserwować
                </button>): ( <button onClick={handleFollow}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_796_12833)">
                      <rect width="12" height="12" fill="white" fillOpacity="0.01" />
                      <g clipPath="url(#clip1_796_12833)">
                        <path
                          d="M11.0831 0.06375C11.1343 0.0979781 11.1763 0.144277 11.2053 0.19856C11.2343 0.252842 11.2496 0.313439 11.2496 0.375V6C11.2496 6.07489 11.2272 6.14806 11.1852 6.21008C11.1432 6.27211 11.0836 6.32014 11.0141 6.348L10.8746 6L11.0141 6.348L11.0119 6.34875L11.0074 6.351L10.9901 6.35775C10.8915 6.39694 10.7923 6.43445 10.6924 6.47025C10.4944 6.5415 10.2191 6.6375 9.90713 6.73275C9.29513 6.92175 8.49788 7.125 7.87463 7.125C7.23938 7.125 6.71363 6.915 6.25613 6.73125L6.23513 6.72375C5.75963 6.5325 5.35463 6.375 4.87463 6.375C4.34963 6.375 3.64613 6.5475 3.04688 6.73275C2.77858 6.81637 2.51272 6.90766 2.24963 7.0065V11.625C2.24963 11.7245 2.21012 11.8198 2.1398 11.8902C2.06947 11.9605 1.97409 12 1.87463 12C1.77518 12 1.67979 11.9605 1.60947 11.8902C1.53914 11.8198 1.49963 11.7245 1.49963 11.625V0.375C1.49963 0.275544 1.53914 0.180161 1.60947 0.109835C1.67979 0.0395088 1.77518 0 1.87463 0C1.97409 0 2.06947 0.0395088 2.1398 0.109835C2.21012 0.180161 2.24963 0.275544 2.24963 0.375V0.5865C2.41913 0.52725 2.62163 0.459 2.84213 0.3915C3.45413 0.204 4.25213 0 4.87463 0C5.50463 0 6.01763 0.20775 6.46538 0.38925L6.49763 0.40275C6.96413 0.591 7.37063 0.75 7.87463 0.75C8.39963 0.75 9.10313 0.5775 9.70238 0.39225C10.0439 0.285609 10.3813 0.16653 10.7141 0.03525L10.7284 0.03L10.7314 0.0285H10.7321L11.0831 0.06375ZM10.4996 0.91575C10.3346 0.97425 10.1396 1.041 9.92513 1.107C9.31763 1.296 8.52113 1.49925 7.87463 1.49925C7.21013 1.49925 6.68063 1.28475 6.22238 1.09875L6.21638 1.0965C5.74613 0.9075 5.35388 0.75 4.87463 0.75C4.37288 0.75 3.67013 0.92175 3.06338 1.1085C2.78971 1.19294 2.51837 1.28472 2.24963 1.38375V6.2085C2.41463 6.15 2.60963 6.08325 2.82413 6.01725C3.43163 5.8275 4.22813 5.625 4.87463 5.625C5.50988 5.625 6.03563 5.835 6.49313 6.01875L6.51413 6.02625C6.98963 6.2175 7.39463 6.375 7.87463 6.375C8.37563 6.375 9.07913 6.20325 9.68588 6.0165C9.95955 5.93206 10.2309 5.84027 10.4996 5.74125V0.9165V0.91575Z"
                          fill="#212529"
                        />
                      </g>
                    </g>
                    <defs>
                      <clipPath id="clip0_796_12833">
                        <rect width="12" height="12" fill="white" />
                      </clipPath>
                      <clipPath id="clip1_796_12833">
                        <rect width="12" height="12" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  Obserwuj
                </button>)}
                
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTag;