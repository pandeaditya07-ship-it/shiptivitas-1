import React from 'react';
import Dragula from 'dragula';
import 'dragula/dist/dragula.css';
import Swimlane from './Swimlane';
import './Board.css';

export default class Board extends React.Component {
  constructor(props) {
    super(props);

    const clients = this.getClients();

    this.state = {
      clients: {
        backlog: clients,
        inProgress: [],
        complete: [],
      }
    };

    this.swimlanes = {
      backlog: React.createRef(),
      inProgress: React.createRef(),
      complete: React.createRef(),
    };

    this.drake = null;

    // Stores the DOM order before Dragula starts moving anything
    this.dragSnapshot = null;
  }

  getClients() {
    return [
      ['1', 'Stark, White and Abbott', 'Cloned Optimal Architecture'],
      ['2', 'Wiza LLC', 'Exclusive Bandwidth-Monitored Implementation'],
      ['3', 'Nolan LLC', 'Vision-Oriented 4Thgeneration Graphicaluserinterface'],
      ['4', 'Thompson PLC', 'Streamlined Regional Knowledgeuser'],
      ['5', 'Walker-Williamson', 'Team-Oriented 6Thgeneration Matrix'],
      ['6', 'Boehm and Sons', 'Automated Systematic Paradigm'],
      ['7', 'Runolfsson, Hegmann and Block', 'Integrated Transitional Strategy'],
      ['8', 'Schumm-Labadie', 'Operative Heuristic Challenge'],
      ['9', 'Kohler Group', 'Re-Contextualized Multi-Tasking Attitude'],
      ['10', 'Romaguera Inc', 'Managed Foreground Toolset'],
      ['11', 'Reilly-King', 'Future-Proofed Interactive Toolset'],
      ['12', 'Emard, Champlin and Runolfsdottir', 'Devolved Needs-Based Capability'],
      ['13', 'Fritsch, Cronin and Wolff', 'Open-Source 3Rdgeneration Website'],
      ['14', 'Borer LLC', 'Profit-Focused Incremental Orchestration'],
      ['15', 'Emmerich-Ankunding', 'User-Centric Stable Extranet'],
      ['16', 'Willms-Abbott', 'Progressive Bandwidth-Monitored Access'],
      ['17', 'Brekke PLC', 'Intuitive User-Facing Customerloyalty'],
      ['18', 'Bins, Toy and Klocko', 'Integrated Assymetric Software'],
      ['19', 'Hodkiewicz-Hayes', 'Programmable Systematic Securedline'],
      ['20', 'Murphy, Lang and Ferry', 'Organized Explicit Access'],
    ].map(companyDetails => ({
      id: companyDetails[0],
      name: companyDetails[1],
      description: companyDetails[2],
      status: 'backlog',
    }));
  }

  componentDidMount() {
    this.drake = Dragula([
      this.swimlanes.backlog.current,
      this.swimlanes.inProgress.current,
      this.swimlanes.complete.current,
    ]);

    // Remember the exact DOM structure BEFORE Dragula changes it
    this.drake.on('drag', this.handleDragStart);

    // Handle the completed drop
    this.drake.on('drop', this.handleDrop);
  }

  componentWillUnmount() {
    if (this.drake) {
      this.drake.destroy();
    }
  }

  /*
   * Save the exact DOM order before Dragula moves anything.
   */
  handleDragStart = () => {
    this.dragSnapshot = {
      backlog: Array.from(
        this.swimlanes.backlog.current.children
      ),

      inProgress: Array.from(
        this.swimlanes.inProgress.current.children
      ),

      complete: Array.from(
        this.swimlanes.complete.current.children
      ),
    };
  };

  /*
   * Put the DOM back exactly as React expects it
   * before calling setState().
   */
  restoreOriginalDom = () => {
    if (!this.dragSnapshot) {
      return;
    }

    const lanes = [
      {
        ref: this.swimlanes.backlog,
        children: this.dragSnapshot.backlog,
      },
      {
        ref: this.swimlanes.inProgress,
        children: this.dragSnapshot.inProgress,
      },
      {
        ref: this.swimlanes.complete,
        children: this.dragSnapshot.complete,
      },
    ];

    lanes.forEach(lane => {
      const container = lane.ref.current;

      lane.children.forEach(child => {
        container.appendChild(child);
      });
    });
  };

  handleDrop = (el, target, source, sibling) => {
    const movedId = el.dataset.id;

    let newStatus = 'backlog';

    if (target === this.swimlanes.inProgress.current) {
      newStatus = 'in-progress';
    } else if (target === this.swimlanes.complete.current) {
      newStatus = 'complete';
    }

    /*
     * Read the order created by Dragula BEFORE restoring the DOM.
     */
    const targetIds = Array.from(target.children)
      .map(child => child.dataset.id)
      .filter(Boolean);

    const allClients = [
      ...this.state.clients.backlog,
      ...this.state.clients.inProgress,
      ...this.state.clients.complete,
    ];

    const movedClient = allClients.find(
      client => client.id === movedId
    );

    if (!movedClient) {
      this.dragSnapshot = null;
      return;
    }

    /*
     * Build the new target lane according to Dragula's order.
     */
    const targetClients = targetIds
      .map(id => {
        const client = allClients.find(
          currentClient => currentClient.id === id
        );

        if (!client) {
          return null;
        }

        return {
          ...client,
          status: newStatus,
        };
      })
      .filter(Boolean);

    /*
     * Build the other lanes.
     */
    const newBacklog = allClients.filter(
      client =>
        client.status === 'backlog' &&
        client.id !== movedId
    );

    const newInProgress = allClients.filter(
      client =>
        client.status === 'in-progress' &&
        client.id !== movedId
    );

    const newComplete = allClients.filter(
      client =>
        client.status === 'complete' &&
        client.id !== movedId
    );

    /*
     * IMPORTANT:
     * Restore the DOM to exactly how React left it
     * before Dragula moved anything.
     */
    this.restoreOriginalDom();

    /*
     * Now React can safely update the DOM.
     */
    this.setState({
      clients: {
        backlog:
          newStatus === 'backlog'
            ? targetClients
            : newBacklog,

        inProgress:
          newStatus === 'in-progress'
            ? targetClients
            : newInProgress,

        complete:
          newStatus === 'complete'
            ? targetClients
            : newComplete,
      },
    });

    this.dragSnapshot = null;
  };

  renderSwimlane(name, clients, ref) {
    return (
      <Swimlane
        name={name}
        clients={clients}
        dragulaRef={ref}
      />
    );
  }

  render() {
    return (
      <div className="Board">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-4">
              {this.renderSwimlane(
                'Backlog',
                this.state.clients.backlog,
                this.swimlanes.backlog
              )}
            </div>

            <div className="col-md-4">
              {this.renderSwimlane(
                'In Progress',
                this.state.clients.inProgress,
                this.swimlanes.inProgress
              )}
            </div>

            <div className="col-md-4">
              {this.renderSwimlane(
                'Complete',
                this.state.clients.complete,
                this.swimlanes.complete
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }
}