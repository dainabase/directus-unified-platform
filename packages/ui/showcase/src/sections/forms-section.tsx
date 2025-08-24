import React, { useState } from 'react';
import {
  Type,
  Lock,
  Search,
  Calendar,
  Upload,
  CheckSquare,
  Sliders,
  Hash,
  Phone,
  CreditCard,
  User,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Minus
} from 'lucide-react';

export const FormsSection: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [tags, setTags] = useState(['React', 'TypeScript', 'Design System']);
  const [switchOn, setSwitchOn] = useState(true);
  const [selectedOption, setSelectedOption] = useState('option1');
  const [checkboxes, setCheckboxes] = useState({
    option1: true,
    option2: false,
    option3: false
  });

  return (
    <div className="space-y-12">
      {/* Text Inputs */}
      <div>
        <h3 className="modern-subheading mb-2">Text Inputs</h3>
        <p className="modern-body mb-6">Essential input fields with various states</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="search"
                    placeholder="Search components..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Credit Card</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input States */}
      <div>
        <h3 className="modern-subheading mb-2">Input States</h3>
        <p className="modern-body mb-6">Different validation and interaction states</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Valid Input</label>
              <div className="relative">
                <input
                  type="text"
                  value="john.doe@example.com"
                  className="w-full pr-10 py-3 border border-gray-400 rounded-lg bg-gray-50"
                  readOnly
                />
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              </div>
              <p className="text-sm text-gray-600 mt-1">Email format is correct</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Error Input</label>
              <div className="relative">
                <input
                  type="text"
                  value="invalid-email"
                  className="w-full pr-10 py-3 border border-gray-400 rounded-lg bg-gray-50"
                  readOnly
                />
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              </div>
              <p className="text-sm text-gray-600 mt-1">Please enter a valid email</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-500">Disabled Input</label>
              <input
                type="text"
                placeholder="Cannot edit this field"
                className="w-full py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">This field is disabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Textarea */}
      <div>
        <h3 className="modern-subheading mb-2">Text Areas</h3>
        <p className="modern-body mb-6">Multi-line text input fields</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
              <textarea
                placeholder="Enter your description here..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Comments</label>
              <textarea
                placeholder="Add your comments..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-y"
              />
              <p className="text-sm text-gray-500 mt-1">Resizable vertically</p>
            </div>
          </div>
        </div>
      </div>

      {/* Select Dropdowns */}
      <div>
        <h3 className="modern-subheading mb-2">Select Dropdowns</h3>
        <p className="modern-body mb-6">Dropdown selection components</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Country</label>
              <select className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors">
                <option>Select a country</option>
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>France</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
              <select className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
              <select className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors">
                <option>Technology</option>
                <option>Design</option>
                <option>Business</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Checkboxes and Radio Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Selection Controls</h3>
        <p className="modern-body mb-6">Checkboxes, radio buttons, and toggles</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium mb-4">Checkboxes</h4>
              <div className="space-y-3">
                {Object.entries(checkboxes).map(([key, checked]) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setCheckboxes(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      Option {key.slice(-1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">Radio Buttons</h4>
              <div className="space-y-3">
                {['option1', 'option2', 'option3'].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="radio-group"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {option === 'option1' ? 'Small' : option === 'option2' ? 'Medium' : 'Large'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders and Range */}
      <div>
        <h3 className="modern-subheading mb-2">Range Controls</h3>
        <p className="modern-body mb-6">Slider and range input components</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-4 text-gray-700">
                Volume: {sliderValue}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-4 text-gray-700">Price Range</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  defaultValue="250"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$500</span>
                  <span>$1000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Switches */}
      <div>
        <h3 className="modern-subheading mb-2">Toggle Switches</h3>
        <p className="modern-body mb-6">On/off toggle controls</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notifications</span>
              <button
                onClick={() => setSwitchOn(!switchOn)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  switchOn ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    switchOn ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Auto-save</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Disabled</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <h3 className="modern-subheading mb-2">File Upload</h3>
        <p className="modern-body mb-6">File selection and upload components</p>
        <div className="modern-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              <button className="modern-button modern-button-secondary mt-4">
                Choose Files
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Uploaded Files</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Type size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">document.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Type size={16} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">image.jpg</p>
                      <p className="text-xs text-gray-500">1.8 MB</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Input */}
      <div>
        <h3 className="modern-subheading mb-2">Tag Input</h3>
        <p className="modern-body mb-6">Multi-value tag selection component</p>
        <div className="modern-card">
          <label className="block text-sm font-medium mb-2 text-gray-700">Skills</label>
          <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-gray-500 transition-colors">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => setTags(tags.filter((_, i) => i !== index))}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a skill..."
              className="w-full border-none outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setTags([...tags, e.currentTarget.value.trim()]);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Form Layouts */}
      <div>
        <h3 className="modern-subheading mb-2">Form Layouts</h3>
        <p className="modern-body mb-6">Complete form examples</p>
        <div className="modern-card">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                className="w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Message</label>
              <textarea
                rows={4}
                placeholder="Your message here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>

            <div className="flex gap-3">
              <button type="button" className="modern-button modern-button-secondary">
                Cancel
              </button>
              <button type="submit" className="modern-button modern-button-primary">
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};