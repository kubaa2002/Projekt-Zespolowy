

import { AiOutlineDislike } from 'react-icons/ai';
import { FaThumbsDown} from "react-icons/fa";
const Dislike = ({ isDisliked,handleDislike,dislikesCount }) => {
  

    if(isDisliked)
  return (
    <span onClick={handleDislike} className='user-select-none'>
    <FaThumbsDown
                    className={`icon active`}
                    
                  />
                <span>{dislikesCount}</span>
      </span>
  );

  if(!isDisliked)
    return (
      <span onClick={handleDislike} >
      <AiOutlineDislike
                      className={`icon}`}
                      
                    />
                    <span>{dislikesCount}</span>
        </span>
    );
};


  
  

export default Dislike;
