import './style.scss';

import { Netmask } from 'netmask';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { List, Map } from 'immutable';

class IPAddress extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleChange(event) {
    // var octets = this.props.block.get('octets');
    var val = +event.target.value.replace(/[^0-9]/g, '');
    var octet = event.target.attributes['data-octet'].value;
    if (octet == 'cidr') {
      if (val <= 32) {
        this.props.updateBlock(this.props.block.set('cidr', val));
      }
    } else {
      if (val <= 255) {
        this.props.updateBlock(this.props.block.update('octets', octets => octets.set(+octet, val)));
        // octets[+octet] = val;
        // this.setState({
        //   octets: octets
        // });
      }
    }
  }

  handleKeyDown(event) {
    var lowerOctetValue = 0;
    var higherOctetValue = event.target.dataset.octet === 'cidr' ? 32 : 255;
    if (event.key === 'ArrowDown' && event.target.value > lowerOctetValue) {
      event.target.value = +event.target.value - 1;
      this.handleChange(event);
    }
    if (event.key === 'ArrowUp' && event.target.value < higherOctetValue) {
      event.target.value = +event.target.value + 1;
      this.handleChange(event);
    }
  }

  getPretty() {
    return this.props.block.get('octets').join('.') + '/' + this.props.block.get('cidr');
  }

  render() {
    var details = new Netmask(this.getPretty());

    return (
      <div className="ip-address">
        <div className="address">
          {[...Array(4)].map((x, octet) => (
            <span className="octet">
              <input
                className="octet"
                type="text"
                data-octet={octet}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                value={this.props.block.getIn(['octets', octet])}
              />
              <span className="dot">{octet == '3' ? '/' : '.'}</span>
            </span>
          ))}
          <input
            className="cidr"
            type="text"
            data-octet="cidr"
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            value={this.props.block.get('cidr')}
          />
        </div>

        <div className="bits">
          <ol>
            {[...Array(4)].map((x, octet) => (
              <li className="octet">
                <ol>
                  {[...Array(8)].map((x, bit) => (
                    <li
                      className={
                        octet * 8 + bit > this.props.block.get('cidr') - 1
                          ? 'bit masked'
                          : 'bit unmasked'
                      }
                    >
                      {(this.props.block.getIn(['octets', octet]) & (1 << (7 - bit))) >>
                        (7 - bit)}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </div>

        <div className="details">
          <span className="netmask">
            <span className="value">{details.mask}</span>
            <span className="label">Netmask</span>
          </span>
          <span className="first">
            <span className="value">{details.first}</span>
            <span className="label">First IP</span>
          </span>
          <span className="last">
            <span className="value">{details.last}</span>
            <span className="label">Last IP</span>
          </span>
          <span className="count">
            <span className="value">{details.size.toLocaleString()}</span>
            <span className="label">Count</span>
          </span>
        </div>
      </div>
    );
  }
}

const initialBlock = Map({
  octets: List([10, 88, 135, 144]),
  cidr: 28
});

class IpAddresses extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blocks: List([initialBlock]),
    };
  }

  handleAdd(e) {
    e.preventDefault();

    this.setState({ blocks: this.state.blocks.push(initialBlock) });
  }

  render() {
    return (
      <div>
        {this.state.blocks.map((block, i) =>
          <IPAddress
            key={i}
            block={block}
            updateBlock={newBlock => {
              this.setState({ blocks: this.state.blocks.set(i, newBlock) });
            }}
          />
        )}

        <p style={{ textAlign: 'center' }}>
          <button onClick={this.handleAdd.bind(this)}>+ Add Block</button>
        </p>
      </div>
    );
  }
}

ReactDOM.render(<IpAddresses />, document.getElementById('app'));
