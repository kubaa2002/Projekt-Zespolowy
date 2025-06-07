

import { AiOutlineDislike } from 'react-icons/ai';
import { FaThumbsDown} from "react-icons/fa";
const Dislike = ({ isDisliked,handleDislike,dislikesCount }) => {
  

    if(isDisliked)
  return (
    <>
    <FaThumbsDown
                    className={`icon active`}
                    onClick={handleDislike}
                  />
                  <span>{dislikesCount}</span>
      </>
  );

  if(!isDisliked)
    return (
      <>
      <AiOutlineDislike
                      className={`icon}`}
                      onClick={handleDislike}
                    />
                    {dislikesCount}
        </>
    );
};


  
  

export default Dislike;
