import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import axios from 'axios'
import api from '../../services/api'

import Dropzone from "./../../components/Dropzone";

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item {
  id: number
  title: string
  image_url: string
}

interface IBGE_UF {
  sigla: string
}

interface IBGECity {
  nome: string
}

const CreateFacility = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUFs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUF, setSelectedUF] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      setInitialPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('categories').then(response => setItems(response.data))
  }, [])

  useEffect(() => {
    axios.get<IBGE_UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => setUFs(response.data.map(uf => uf.sigla).sort()))
  }, [])

  useEffect(() => {
    if (selectedUF !== '0') {
      axios
        .get<IBGECity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then(response => setCities(response.data.map(city => city.nome).sort()))
    }
  }, [selectedUF])


  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUF(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const data = new FormData()

    data.append('name', formData.name)
    data.append('email', formData.email)
    data.append('whatsapp', formData.whatsapp)
    data.append('uf', selectedUF)
    data.append('city', selectedCity)
    data.append('latitude', String(selectedPosition[0]))
    data.append('longitude', String(selectedPosition[1]))
    data.append('categories', selectedItems.join(','))
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('facilities', data)

    alert('Ponto de coleta criado com sucesso!')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta logo" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form action="" onSubmit={handleSubmit}>
        <h1>Cadastro do <br />ponto de coleta </h1>

        <fieldset>
          <Dropzone onFileUpload={setSelectedFile} />
        </fieldset>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text"
              name="name"
              id="name"
              onChange={handleInputChange} />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input type="email"
                name="email"
                id="email"
                onChange={handleInputChange} />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatpsapp</label>
              <input type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange} />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          {/* <Map center={[-16.221811, -52.0773088]} zoom={3} onClick={handleMapClick}> */}
          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
              selectedPosition[0] !== 0 && selectedPosition[1] !== 0 ? <Marker position={selectedPosition} /> : null
            }
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectUF} value={selectedUF}>
                <option value={'0'}>Selecione uma UF</option>
                {ufs.map(uf => (
                  <option value={uf} key={uf}>{uf}</option>
                )
                )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                <option value={'0'}>Selecione uma cidade</option>
                {cities.map(city => (
                  <option value={city} key={city}>{city}</option>
                )
                )}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>

          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div >
  )
}

export default CreateFacility