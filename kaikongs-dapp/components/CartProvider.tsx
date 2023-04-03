import { createContext, useState } from 'react'

export const ctx = createContext({
  ids: [],
  handleSetIds: (ids: Array<string>) => {}
})

export default function CartProvider({children}) {
  const [ids, setIds] = useState([])
  const handleSetIds = (ids) => {
    setIds([...ids])
  }

  return <ctx.Provider value={{ids, handleSetIds}}>
    {children}
  </ctx.Provider>
}