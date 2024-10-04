'use client'

import { scapeAndStroeProduct } from '@/lib/actions';
import { FormEvent, useState } from 'react'

const isValidLinkAmazonProductURL = (url: string) =>{
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;
    
    if(
      hostname.includes('amazon.com') || 
      hostname.includes('amazon.') ||
      hostname.endsWith('amazon')
      ) {
        return true;
      }
  } catch (error) {
    return false;
  }
}

const Searchbar = () => {
  const [searchPrompt, setsearchPrompt] = useState('')
  const [isLoading, setisLoading] = useState(false);

  const handleSubmit  = async (event: FormEvent<HTMLFormElement>) =>{
    event.preventDefault();

    const isValidLink = isValidLinkAmazonProductURL(searchPrompt);

    if(!isValidLink) return alert('Nhap dung link cua Amazon')

    try {
      setisLoading(true);

      const product = await scapeAndStroeProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally{
      setisLoading(false);
    }
  }


  return (
    <form 
    className="flex flex-wrap gap-4 mt-12"
    onSubmit={handleSubmit}
    >
        <input
            type="text"
            value={searchPrompt}
            onChange={(e) => setsearchPrompt(e.target.value)}
            placeholder="Enter product link"
            className="searchbar-input"
        />
    
        <button 
        type="submit" 
        className="searchbar-btn"
        disabled={searchPrompt === ''}
        
        >
            {isLoading ? 'Search....' : 'Sreach'}
        </button>
    </form>
  )
}

export default Searchbar